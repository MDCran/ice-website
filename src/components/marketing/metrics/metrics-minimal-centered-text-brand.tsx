export const MetricsMinimalCenteredTextBrand = () => {
    return (
        <section className="bg-brand-section py-16 md:py-24">
            <div className="mx-auto max-w-container px-4 md:px-8">
                <dl className="grid gap-x-4 gap-y-8 border-brand md:grid-cols-2 md:border-y md:py-16 lg:grid-cols-4">
                    {[
                        {
                            title: "400+",
                            subtitle: "Projects completed",
                        },
                        {
                            title: "600%",
                            subtitle: "Return on investment",
                        },
                        {
                            title: "10k",
                            subtitle: "Global downloads",
                        },
                        {
                            title: "200+",
                            subtitle: "5-star reviews",
                        },
                    ].map((item) => (
                        <div key={item.title} className="flex flex-1 flex-col-reverse gap-3 text-center">
                            <dt className="text-lg font-semibold text-tertiary_on-brand">{item.subtitle}</dt>
                            <dd className="text-display-lg font-semibold text-primary_on-brand md:text-display-xl">{item.title}</dd>
                        </div>
                    ))}
                </dl>
            </div>
        </section>
    );
};
