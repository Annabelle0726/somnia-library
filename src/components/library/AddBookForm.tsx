// src/components/library/AddBookForm.tsx
import React from 'react';
import { useBookForm } from '../../hooks/useBookForm';
import { BookFormFields } from './BookFormFields';

interface AddBookFormProps {
    initialTitle?: string;
    onSuccess?: () => void;
    onCancel?: () => void;
}

export const AddBookForm: React.FC<AddBookFormProps> = ({ initialTitle, onSuccess, onCancel }) => {
    const { form, updateField, loading, errorMsg, fetchingIsbn, fetchByIsbn, submit } = useBookForm(initialTitle);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        submit(onSuccess);
    };

    return (
        <BookFormFields
            form={form}
            updateField={updateField}
            loading={loading}
            errorMsg={errorMsg}
            fetchingIsbn={fetchingIsbn}
            fetchByIsbn={fetchByIsbn}
            onSubmit={handleSubmit}
            onCancel={onCancel}
        />
    );
};