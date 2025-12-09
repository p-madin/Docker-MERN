import React from 'react';

interface XmlFormProps {
    nameDependency: string;
    action?: string;
    method?: string;
    onSubmit?: (e: React.FormEvent) => void;
    rows: Array<{
        label: string;
        name: string;
        type: string;
        [key: string]: any;
    }>;
}

const XmlForm: React.FC<XmlFormProps> = ({ nameDependency, action, method, onSubmit, rows }) => {
    return (
        <form action={action} method={method} onSubmit={onSubmit} className="flex-table">
            <div className="flex-table">
                {rows.map((row, index) => {
                    const { label, name, type, ...otherProps } = row;
                    const myId = `${nameDependency}_${name}_UI`;
                    return (
                        <div className="flex-row" key={index}>
                            <div className="flex-cell">
                                <label htmlFor={myId}>{label}</label>
                            </div>
                            <div className="flex-cell">
                                <input
                                    id={myId}
                                    type={type}
                                    name={name}
                                    {...otherProps}
                                />
                            </div>
                        </div>
                    );
                })}
                <div className="flex-row">
                    <div className="flex-cell"></div>
                    <div className="flex-cell">
                        <input
                            id={`submit_${nameDependency}_UI`}
                            type="submit"
                        />
                    </div>
                </div>
            </div>
        </form>
    );
};

export default XmlForm;
