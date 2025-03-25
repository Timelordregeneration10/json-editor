
import { useEffect, useState } from "react";

export function useWindow() {
    const [width, setWidth] = useState<number>(0);
    const [height, setHeight] = useState<number>(0);

    useEffect(() => {
        if (typeof window !== undefined) {
            const handleResize = () => {
                setWidth(window.innerWidth);
                setHeight(window.innerHeight);
            };
            handleResize();
            window.addEventListener("resize", handleResize);
            return () => {
                window.removeEventListener("resize", handleResize);
            };
        }
    }, []);

    return { width, height };
}

export default useWindow;