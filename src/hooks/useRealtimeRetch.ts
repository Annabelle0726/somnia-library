import {useEffect} from 'react'
import {useQueryClient, type QueryKey} from '@tanstack/react-query'
import {supabase} from '../lib/supabase'

export function useRealtimeRefetch(
    // 在 React 中，数组和对象每次渲染时内存地址都不同，这会导致 useEffect 频繁、错误地重复执行。
    // 这里巧妙地把它们转成了字符串（JSON String），只有当里面的内容真正变化时，才会重新触发订阅
    channel: string,
    subs: { table: string; filter?: string }[],
    keys: QueryKey[],
) {
    const qc = useQueryClient()
    // Serialize inputs so the effect only re-subscribes when they truly change.
    const subsId = JSON.stringify(subs)
    const keysId = JSON.stringify(keys)

    useEffect(() => {
        // 建立一个长连接通道（像一个专属的对讲机频道）
        const ch = supabase.channel(channel)
        for (const s of JSON.parse(subsId) as { table: string; filter?: string }[]) {
            ch.on(
                'postgres_changes',
                // 绑定监听事件：
                // 代码遍历你传入的表（table），只要这些表发生任何变化（event: '*'，代表新增、修改、删除），就会触发回调函数
                {event: '*', schema: 'public', table: s.table, ...(s.filter ? {filter: s.filter} : {})},
                () => {
                    // 让本地缓存失效（Refetch）：
                    // 当监听到数据库变动时，它会执行 qc.invalidateQueries({ queryKey: k })
                    // React Query 收到这个指令后，会立刻向后端重新拉取最新的数据，网页上的 UI 就会“无刷实时更新”
                    for (const k of JSON.parse(keysId) as QueryKey[]) void qc.invalidateQueries({queryKey: k})
                },
            )
        }
        ch.subscribe()
        return () => {
            // 在 useEffect 的 return 中，当组件销毁时，它会执行 supabase.removeChannel(ch)，主动断开连接，防止内存泄漏
            void supabase.removeChannel(ch)
        }
    }, [channel, subsId, keysId, qc])
}