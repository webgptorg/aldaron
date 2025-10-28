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

                <div className="grid grid-cols-1 mt-12 sm:grid-cols-2 lg:grid-cols-2 gap-x-8 gap-y-12 lg:mt-16 items-center">
                    <div className="grid grid-cols-2 gap-x-4 items-center">
                        <Image
                            className="object-cover mx-auto"
                            src="https://github.com/webgptorg/promptbook/blob/main/design/people/jiri-jahn-transparent.png?raw=true"
                            alt="Jiri Jahn"
                            width={300}
                            height={300}
                        />
                        <div className="text-left">
                            <p className="text-xl font-bold text-gray-900 font-pj">CEO | Jiří Jahn</p>
                            <p className="mt-4 text-base text-gray-500">
                                Ph.D. in Mathematics, former researcher at IT4I National Supercomputing Centre.
                            </p>
                            <p className="mt-4 text-base text-gray-500">jiri@ptbk.io</p>
                            <p className="mt-1 text-base text-gray-500">+420 777 090 067</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-x-4 items-center">
                        <div className="text-left">
                            <p className="text-xl font-bold text-gray-900 font-pj">Pavol Hejný | CTO</p>
                            <p className="mt-4 text-base text-gray-500">
                                Top open-source contributor in CZE. Developer with 15+ years of experience.
                            </p>
                            <p className="mt-4 text-base text-gray-500">pavol@ptbk.io</p>
                            <p className="mt-1 text-base text-gray-500">+420 777 759 767</p>
                        </div>
                        <Image
                            className="object-cover mx-auto"
                            src="https://github.com/webgptorg/promptbook/blob/main/design/people/pavol-hejny-transparent.png?raw=true"
                            alt="Pavol Hejný"
                            width={300}
                            height={300}
                        />
                    </div>
                </div>
            </div>
        </section>
    );
};
