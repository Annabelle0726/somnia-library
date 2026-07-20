// 💡 运行后通过 DEV_EMAIL 登录应用。
// 对应的登录魔术链接（Magic Link）会发送到本地测试邮件捕获器 Mailpit 中：
// 访问 http://127.0.0.1:54324 即可查看并点击登录。

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { createClient } from '@supabase/supabase-js'

// 📌 【重点】通过现代 ESM 的 import.meta.url 获取当前项目根目录 (..)
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')

// -----------------------------------------------------------------------------
// 配置开发环境变量：优先读取环境变量，没有则使用本地 Supabase 容器的默认配置
// -----------------------------------------------------------------------------
const SUPABASE_URL = process.env.SUPABASE_URL ?? 'http://127.0.0.1:54321'

// 标准的本地专属 service-role 密钥（签发者: supabase-demo）。这绝对不是生产环境的密钥，安全可公开。
const SERVICE_ROLE_KEY =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
const DEV_EMAIL = process.env.DEV_EMAIL ?? 'dev@reverie.local'
const DEV_PASSWORD = process.env.DEV_PASSWORD ?? 'reverie-dev-password'

// 📌 【重点】使用服务密钥（Service Role Key）初始化 Supabase 客户端，该客户端拥有管理员最高权限，会绕过 RLS（行级安全策略）
const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }, // 脚本运行不需要保持会话和自动刷新 token
})

// 工具函数：将空字符串或 null 转换为数字，确保存入 Postgres 数值列时不会报错
const num = (v) => (v === '' || v == null ? null : Number(v))

/**
 * 🔥【重点函数：平铺重构】数据清洗与格式转化
 * 逻辑：根据种子数据里原本单一的 format（格式）和 source（来源，如 "Owned" 拥有 或 "Borrowed" 借阅）
 * 来推导并平铺出 Postgres 中各个媒介格式的布尔拥有状态（实体书、电子书、有声书）。
 */
function ownedFrom(b) {
    const f = (b.format || '').toLowerCase()
    const owned = b.source === 'Owned' // 只有来源是 "Owned" 时才计算拥有状态
    return {
        // 实体书状态判断：精细化推导精装书(hardcover)或平装书(paperback)
        owned_physical: owned
            ? f.includes('hardcover')
                ? 'hardcover'
                : f.includes('paperback') || f.includes('special')
                    ? 'paperback'
                    : !/(ebook|kindle|audio)/.test(f) // 如果既不是电子书也不是有声书，默认当作平装书处理
                        ? 'paperback'
                        : null
            : null,
        owned_ebook: owned && (f.includes('ebook') || f.includes('kindle')), // 是否拥有电子书
        owned_audiobook: owned && f.includes('audio'), // 是否拥有有声书
    }
}

/**
 * 🔥【重点函数：NoSQL 转换为 Relational】
 * 将前端接收到的 JSON 复杂对象（包含嵌套结构），平铺映射为 Postgres 数据库 books 表里的一行记录
 */
function toRow(b, ownerId) {
    return {
        owner_id: ownerId, // 绑定当前所属的用户 ID
        ...ownedFrom(b),    // 展开并混入刚才平铺出来的拥有状态字段
        title: b.title,
        author_first: b.first || null,
        author_last: b.last || null,
        series: b.series || null,
        position: num(b.position),
        series_count: b.seriesCount ?? null,
        status: b.status || null,
        genre: b.genre ?? 'romance',
        subgenre: b.subgenre || null,
        genres: b.genres ?? [],
        tags: b.tropes ?? b.tags ?? [], // 兼容处理：种子 JSON 仍保留了言情小说的特有术语 "tropes" 键
        intensity: b.spice ?? b.intensity ?? 0, // 兼容处理：大尺度指数（spice 或 intensity）
        cover_url: b.cover || null,
        isbn: b.isbn || null,
        fave: !!b.fave,
        format: b.format || null,
        rating: b.rating ?? 0,
        read_status: b.readStatus || 'Unread',
        source: b.source || null,
        pub_y: b.pub?.y ?? null, // 拆分嵌套的出版日期对象：年
        pub_m: b.pub?.m ?? null, // 拆分嵌套的出版日期对象：月
        pub_d: b.pub?.d ?? null, // 拆分嵌套的出版日期对象：日
        progress: b.progress ?? 0,
    }
}

/**
 * 确保开发用户存在
 * 逻辑：先去 Supabase 查一下有没有 dev@reverie.local 这个人。有就直接返回 ID；没有就现生一个。
 */
async function ensureDevUser() {
    const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 })
    if (error) throw error
    const existing = data.users.find((u) => u.email === DEV_EMAIL)
    if (existing) return existing.id // 用户已存在，直接返回

    // 用户不存在，利用最高权限创建新用户并默认自动验证邮箱
    const created = await admin.auth.admin.createUser({
        email: DEV_EMAIL,
        password: DEV_PASSWORD,
        email_confirm: true,
        user_metadata: { display_name: 'Dev Reader' },
    })
    if (created.error) throw created.error
    return created.data.user.id
}

// 辅助工具：将作者名字去除两端空格、转低聚、合并多余空格，作为唯一识别的 Key
const nameKey = (s) => (s || '').trim().toLowerCase().replace(/\s+/g, ' ')

/**
 * 🔥【重点函数：多表关联拆分（三范式标准化）】
 * 解释：从每本书的 author_first/author_last 中提取并生成规范化的 `authors`（作者表）和 `book_authors`（书与作者多对多关系表）。
 *
 * 💡 架构设计注释：
 * 因为这是全新的开发环境初始化，虽然数据库迁移脚本（Migrations）也能自动做类似的数据回填，但迁移通常在种子加载前就已经跑完了。
 * 此外，这里的最高权限（Service Role）可以绕过 RLS 策略直接删写数据，但数据库里的自定义 RPC 函数 `set_book_contributors`
 * 严格限制了必须是“书籍拥有者”本人才能调用，通过 Service Role 无法正常调用它，所以必须在这个脚本里通过原始 SQL/API 批量实现。
 */
async function seedContributors(ownerId) {
    // 1. 从刚刚插入的 books 表里，捞出所有书的作者姓名组合
    const { data: books, error } = await admin
        .from('books')
        .select('id, author_first, author_last')
        .eq('owner_id', ownerId)
    if (error) throw error

    // 辅助工具：将姓和名拼接成完整的姓名
    const fullName = (b) => [b.author_first, b.author_last].filter(Boolean).join(' ').trim()

    // 2. 利用 Map 的 Key 唯一性，对提取出的作者进行“去重”（Deduping）
    const byKey = new Map()
    for (const b of books) {
        const name = fullName(b)
        if (name && !byKey.has(nameKey(name))) byKey.set(nameKey(name), name)
    }

    // 3. 【重点清空】先删掉这个用户旧的关联关系，防止后续重复插入导致唯一性报错
    await admin.from('book_authors').delete().eq('owner_id', ownerId)
    await admin.from('authors').delete().eq('owner_id', ownerId)

    // 4. 【写入作者表】组装数据，批量向 `authors` 表中插入去重后的作者
    const authorRows = [...byKey].map(([name_key, name]) => ({ owner_id: ownerId, name, name_key }))
    const { data: authors, error: ae } = await admin.from('authors').insert(authorRows).select('id, name_key')
    if (ae) throw ae

    // 建立一个由 姓名Key -> 数据库中真实作者ID 的快速映射字典
    const idByKey = new Map(authors.map((a) => [a.name_key, a.id]))

    // 5. 【建立关联关系】一本书可能对应一个或多个作者，把书籍 ID 和作者 ID 绑在一起
    const links = []
    for (const b of books) {
        const name = fullName(b)
        if (!name) continue
        links.push({
            book_id: b.id,
            author_id: idByKey.get(nameKey(name)),
            owner_id: ownerId,
            position: 0,       // 排序：由于当前没有多作者处理，默认第一作者位置为 0
            role: 'author'     // 身份：作者
        })
    }
    // 批量将对应关系插入 `book_authors` 关系表
    if (links.length) {
        const { error: le } = await admin.from('book_authors').insert(links)
        if (le) throw le
    }
    return authors.length // 返回成功创建的去重后的作者总数
}

// -----------------------------------------------------------------------------
// 主执行函数（流程总控）
// -----------------------------------------------------------------------------
async function main() {
    // 第一步：确保开发账号已经初始化就绪，拿到 ownerId
    const ownerId = await ensureDevUser()

    // 第二步：📌【重点】通过 node:fs 模块，同步读取并在内存中解析数据源文件 `personal_seed.json`
    const seed = JSON.parse(readFileSync(resolve(root, 'data/personal_seed.json'), 'utf8'))

    // 第三步：【毁灭与清空】为了防止每次运行脚本都叠加上一次的数据，先彻底清空当前用户的所有旧书籍
    const del = await admin.from('books').delete().eq('owner_id', ownerId)
    if (del.error) throw del.error

    // 第四步：【批量加工与插入】遍历 JSON 里的每一本书，用 toRow 加工平铺成关系型表结构，然后批量写入 `books`
    const rows = seed.map((b) => toRow(b, ownerId))
    const ins = await admin.from('books').insert(rows)
    if (ins.error) throw ins.error

    // 第五步：【处理衍生多表关联】解析书籍中的作者名，去重后分别塞入 `authors` 和中间桥接表 `book_authors`
    const authorCount = await seedContributors(ownerId)

    // 第六步：【精确计数】用 head:true 告诉 Postgres：“我只发起一次高性能的计数查询，别给我吐具体的行数据回来”
    const { count } = await admin
        .from('books')
        .select('*', { count: 'exact', head: true })
        .eq('owner_id', ownerId)

    // 控制台大功告成输出提示
    console.log(`Seeded ${rows.length} books (${authorCount} distinct authors) for ${DEV_EMAIL} (owner ${ownerId}); table now holds ${count}.`)
}

// 启动并捕获异常
main().catch((e) => {
    console.error('Seed failed:', e.message ?? e)
    process.exit(1) // 异常时退出进程
})