export const SocialProofCard = () => {
    return (
        <section className="bg-primary py-16 md:py-24">
            <div className="mx-auto max-w-container md:px-8">
                <div className="flex flex-col gap-8 bg-secondary px-6 py-12 md:rounded-2xl md:p-16">
                    <p className="text-center text-md font-medium text-tertiary md:text-xl">Trusted by 4,000+ companies</p>
                    <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 xl:gap-x-8">
                        {/* Light mode images (hidden in dark mode) */}
                        <img alt="Catalog" src="https://www.untitledui.com/logos/logotype/color/catalog.svg" className="h-9 md:h-10 dark:hidden" />
                        <img alt="Pictelai" src="https://www.untitledui.com/logos/logotype/color/pictel-ai.svg" className="h-9 md:h-10 dark:hidden" />
                        <img alt="Leapyear" src="https://www.untitledui.com/logos/logotype/color/leapyear.svg" className="h-9 md:h-10 dark:hidden" />
                        <img alt="Peregrin" src="https://www.untitledui.com/logos/logotype/color/peregrin.svg" className="h-9 md:h-10 dark:hidden" />
                        <img alt="Easytax" src="https://www.untitledui.com/logos/logotype/color/easy-tax.svg" className="h-9 md:h-10 dark:hidden" />
                        <img
                            alt="Coreos"
                            src="https://www.untitledui.com/logos/logotype/color/core-os.svg"
                            className="inline-flex h-9 md:hidden md:h-10 dark:hidden"
                        />

                        {/* Dark mode images (hidden in light mode) */}
                        <img
                            alt="Catalog"
                            src="https://www.untitledui.com/logos/logotype/white/catalog.svg"
                            className="h-9 opacity-85 not-dark:hidden md:h-10"
                        />
                        <img
                            alt="Pictelai"
                            src="https://www.untitledui.com/logos/logotype/white/pictel-ai.svg"
                            className="h-9 opacity-85 not-dark:hidden md:h-10"
                        />
                        <img
                            alt="Leapyear"
                            src="https://www.untitledui.com/logos/logotype/white/leapyear.svg"
                            className="h-9 opacity-85 not-dark:hidden md:h-10"
                        />
                        <img
                            alt="Peregrin"
                            src="https://www.untitledui.com/logos/logotype/white/peregrin.svg"
                            className="h-9 opacity-85 not-dark:hidden md:h-10"
                        />
                        <img
                            alt="Easytax"
                            src="https://www.untitledui.com/logos/logotype/white/easy-tax.svg"
                            className="h-9 opacity-85 not-dark:hidden md:h-10"
                        />
                        <img
                            alt="Coreos"
                            src="https://www.untitledui.com/logos/logotype/white/core-os.svg"
                            className="inline-flex h-9 opacity-85 not-dark:hidden md:hidden md:h-10"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
};
