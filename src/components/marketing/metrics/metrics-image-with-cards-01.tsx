import { Badge } from "@/components/base/badges/badges";

export const MetricsImageWithCards01 = () => {
    return (
        <section className="bg-primary py-16 md:py-24">
            <div className="mx-auto max-w-container px-4 md:px-8">
                <div className="flex flex-col gap-12 md:gap-16">
                    <div className="flex w-full flex-col items-center text-center md:max-w-3xl md:self-center">
                        <Badge size="lg" type="pill-color" color="brand" className="max-md:hidden">
                            Launch faster
                        </Badge>
                        <Badge size="md" type="pill-color" color="brand" className="inline-block md:hidden">
                            Launch faster
                        </Badge>
                        <h2 className="mt-4 text-display-sm font-semibold text-primary md:text-display-md">Build something great</h2>
                        <p className="mt-4 hidden text-lg text-tertiary md:mt-5 md:block md:text-xl">
                            Everything you need to build modern UI and great products.
                        </p>
                        <p className="mt-4 block text-lg text-tertiary md:mt-5 md:hidden md:text-xl">
                            Powerful, self-serve product and growth analytics to help you convert, engage, and retain more users. Trusted by over 4,000
                            startups.
                        </p>
                    </div>

                    <dl className="relative grid grid-cols-1 gap-8 px-6 py-8 md:grid-cols-2 md:p-16 lg:grid-cols-3">
                        <img
                            alt="Workspace 3"
                            src="https://www.untitledui.com/marketing/workspace-3.webp"
                            className="absolute inset-0 z-0 size-full object-cover"
                        />

                        {[
                            {
                                title: "400+",
                                subtitle: "Projects completed",
                                description: "We've helped build over 400 projects with great companies.",
                            },
                            {
                                title: "600%",
                                subtitle: "Return on investment",
                                description: "We've helped build over 400 projects with great companies.",
                            },
                            {
                                title: "10k",
                                subtitle: "Global downloads",
                                description: "Our free UI kit has been downloaded over 10k times.",
                            },
                        ].map((item, index) => (
                            <div
                                key={index}
                                className="z-10 rounded-2xl bg-alpha-white/30 p-6 text-center ring-1 ring-alpha-white/30 backdrop-blur-xl ring-inset"
                            >
                                <dd className="text-display-lg font-semibold text-white md:text-display-xl">{item.title}</dd>
                                <dt className="mt-3 text-lg font-semibold text-white">{item.subtitle}</dt>
                                <p className="mt-1 text-md text-white">{item.description}</p>
                            </div>
                        ))}
                    </dl>
                </div>
            </div>
        </section>
    );
};
