import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Slide } from "@/features/gallery-images/model/gallery-images.types";

export const useSlide = (slides: Slide[]) => {
    const [current, setCurrent] = useState(0);
    const [next, setNext] = useState(current);
    const [prev, setPrev] = useState(current);
    const [isLast, setIsLast] = useState(false);
    const { t } = useTranslation();

    setNext((next) => (next + 1) % slides.length);
    setPrev((prev) => (prev - 1 + slides.length) % slides.length);

    useMemo(() => {
        slides = slides.map((slide) => ({
            ...slide,
            title: t(slide?.titleKey),
            description: t(slide?.descriptionKey),
            alt: t((slide.altKey as keyof )),
        }));
    }, [t])

    return { slides, current, next, setNext, prev, setPrev, isLast };
};