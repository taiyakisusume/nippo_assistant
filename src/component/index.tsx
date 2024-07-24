import {ReactNode} from "react";
import {Switch} from "@headlessui/react";

export const CardComponent = ({children}: {children: ReactNode}) => {
    return (
        <div
            className="divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white shadow
                transition-shadow hover:shadow-md"
        >
            {children}
        </div>
    );
};

interface SwitchProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
}

export const SwitchComponent = (props: SwitchProps) => {
    return (
        <Switch
            checked={props.checked}
            onChange={props.onChange}
            className="group relative flex h-6 w-12 cursor-pointer rounded-full bg-gray-400 p-0.5
                transition-colors duration-200 ease-in-out data-[checked]:bg-green-500"
        >
            <span
                aria-hidden="true"
                className="pointer-events-none inline-block size-5 translate-x-0 rounded-full bg-white
                    shadow-lg ring-0 transition duration-200 ease-in-out
                    group-data-[checked]:translate-x-6"
            />
        </Switch>
    );
};

interface TooltipProps {
    children: ReactNode;
    tooltip?: string;
}

export const TooltipComponent = ({children, tooltip}: TooltipProps) => {
    return (
        <span className="relative">
            <div className="peer size-fit">{children}</div>
            {tooltip && (
                <span
                    className="pointer-events-none absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap
                        rounded bg-black px-2 py-1 text-white opacity-0 transition
                        peer-hover:opacity-100"
                >
                    {tooltip}
                </span>
            )}
        </span>
    );
};
