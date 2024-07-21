import {ReactNode} from "react";
import {Switch} from "@headlessui/react";

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

interface SwitchProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
}

export const SwitchComponent = (props: SwitchProps) => {
    return (
        <Switch
            checked={props.checked}
            onChange={props.onChange}
            className="group relative flex h-7 w-14 scale-75 cursor-pointer rounded-full bg-gray-400
                p-1 transition-colors duration-200 ease-in-out data-[checked]:bg-green-500"
        >
            <span
                aria-hidden="true"
                className="pointer-events-none inline-block size-5 translate-x-0 rounded-full bg-white
                    shadow-lg ring-0 transition duration-200 ease-in-out
                    group-data-[checked]:translate-x-7"
            />
        </Switch>
    );
};
