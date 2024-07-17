import {ReactNode} from "react";

export const CardComponent = ({children}: {children: ReactNode}) => {
    return (
        <div
            className="divide-y divide-gray-200 overflow-hidden rounded-lg border border-gray-200
                bg-white shadow transition-shadow hover:shadow-md"
        >
            {children}
        </div>
    );
};
