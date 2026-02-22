import React, { useState, useEffect, useRef } from 'react';

interface EditCellProps {
    value: number | undefined;
    onChange: (v: number) => void;
    disabled?: boolean;
    rowIdx?: number;
    colIdx?: number;
}

const EditCell: React.FC<EditCellProps> = ({ value, onChange, disabled, rowIdx, colIdx }) => {
    const [editing, setEditing] = useState(false);
    const [local, setLocal] = useState(String(value));
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!editing) {
            setLocal(String(value ?? 0));
        }
    }, [value, editing]);

    const handleBlur = () => {
        const val = Number(local) || 0;
        onChange(val);
        setEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleBlur();
            moveFocus(1, 0);
        } else if (e.key === 'Tab') {
            e.preventDefault();
            handleBlur();
            if (e.shiftKey) {
                moveFocus(0, -1);
            } else {
                moveFocus(0, 1);
            }
        } else if (e.key === 'ArrowDown') {
            handleBlur();
            moveFocus(1, 0);
        } else if (e.key === 'ArrowUp') {
            handleBlur();
            moveFocus(-1, 0);
        } else if (e.key === 'ArrowRight') {
            // Immediate move on ArrowRight if no selection or at end
            if (!inputRef.current || inputRef.current.selectionStart === inputRef.current.selectionEnd) {
                if (inputRef.current && inputRef.current.selectionStart === local.length) {
                    handleBlur();
                    moveFocus(0, 1);
                }
            }
        } else if (e.key === 'ArrowLeft') {
            // Immediate move on ArrowLeft if no selection or at start
            if (!inputRef.current || inputRef.current.selectionStart === inputRef.current.selectionEnd) {
                if (inputRef.current && inputRef.current.selectionStart === 0) {
                    handleBlur();
                    moveFocus(0, -1);
                }
            }
        }
    };

    const moveFocus = (rowDelta: number, colDelta: number) => {
        if (rowIdx === undefined || colIdx === undefined) return;

        // Use timeout to allow React to render/blur
        setTimeout(() => {
            const nextRow = rowIdx + rowDelta;
            const nextCol = colIdx + colDelta;
            // Try to find the next elements data-row and data-col
            const selector = `[data-row="${nextRow}"][data-col="${nextCol}"]`;
            const nextEl = document.querySelector(selector) as HTMLElement;
            if (nextEl) {
                nextEl.click(); // This triggers setEditing(true) for spans
                // If it's already an input (unlikely due to blur, but for robustness)
                if (nextEl.tagName === 'INPUT') {
                    nextEl.focus();
                }
            }
        }, 50);
    };

    if (disabled) return <span style={{ fontSize: 10 }}>{value ?? 0}</span>;

    if (editing) {
        return (
            <input
                ref={inputRef}
                autoFocus
                value={local}
                data-row={rowIdx}
                data-col={colIdx}
                onChange={e => setLocal(e.target.value)}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                onFocus={(e) => e.target.select()}
                style={{
                    width: '100%',
                    minWidth: 40,
                    fontSize: 10,
                    textAlign: 'center',
                    border: '1px solid #3b82f6',
                    borderRadius: 2,
                    outline: 'none',
                    padding: 0,
                    margin: 0
                }}
            />
        );
    }

    return (
        <span
            onClick={() => setEditing(true)}
            data-row={rowIdx}
            data-col={colIdx}
            style={{
                cursor: 'pointer',
                fontSize: 10,
                display: 'block',
                width: '100%',
                minHeight: 16,
                color: value === 0 ? '#94a3b8' : '#111'
            }}
        >
            {value}
        </span>
    );
};

export default EditCell;
