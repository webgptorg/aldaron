import Image from 'next/image';

export const TeamSection = () => {
    return (
        <section className="py-12 bg-white sm:py-16 lg:py-20">
            <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl xl:text-5xl font-pj">
                        Meet the team behind Promptbook
                    </h2>
                </div>

                <div className="grid grid-cols-1 mt-12 sm:grid-cols-2 lg:grid-cols-2 gap-x-8 gap-y-12 lg:mt-16">
                    <div className="text-center">
                        <div className="relative inline-flex">
                            <div className="absolute -inset-2">
                                <div
                                    className="w-full h-full mx-auto rotate-180 opacity-30 blur-lg filter"
                                    style={{
                                        background:
                                            'linear-gradient(90deg, #44ff9a -0.55%, #44b0ff 22.86%, #8b44ff 48.36%, #ff6644 73.33%, #ebff70 99.34%)',
                                    }}
                                ></div>
                            </div>
                            <Image
                                className="relative object-cover w-48 h-48 mx-auto rounded-full"
                                src="https://github.com/webgptorg/promptbook/blob/main/design/people/jiri-jahn-transparent.png?raw=true"
                                alt="Jiri Jahn"
                                width={192}
                                height={192}
                            />
                        </div>
                        <div className="mt-6">
                            <p className="text-xl font-bold text-gray-900 font-pj">Jiří Jahn</p>
                            <p className="mt-2 text-base font-normal text-gray-600 font-pj">CEO</p>
                            <p className="mt-4 text-base text-gray-500">
                                Ph.D. in Mathematics, former researcher at IT4I National Supercomputing Centre.
                            </p>
                        </div>
                    </div>

                    <div className="text-center">
                        <div className="relative inline-flex">
                            <div className="absolute -inset-2">
                                <div
                                    className="w-full h-full mx-auto rotate-180 opacity-30 blur-lg filter"
                                    style={{
                                        background:
                                            'linear-gradient(90deg, #44ff9a -0.55%, #44b0ff 22.86%, #8b44ff 48.36%, #ff6644 73.33%, #ebff70 99.34%)',
                                    }}
                                ></div>
                            </div>
                            <Image
                                className="relative object-cover w-48 h-48 mx-auto rounded-full"
                                src="https://github.com/webgptorg/promptbook/blob/main/design/people/pavol-hejny-transparent.png?raw=true"
                                alt="Pavol Hejný"
                                width={192}
                                height={192}
                            />
                        </div>
                        <div className="mt-6">
                            <p className="text-xl font-bold text-gray-900 font-pj">Pavol Hejný</p>
                            <p className="mt-2 text-base font-normal text-gray-600 font-pj">CTO</p>
                            <p className="mt-4 text-base text-gray-500">
                                Top open-source contributor in CZE. Developer with 15+ years of experience.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
