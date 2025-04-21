'use client'
import { Button, Card, CardBody, CardFooter, CardHeader, Image } from '@heroui/react'
import Link from 'next/link';
import React from 'react'
import { LuArrowRight } from 'react-icons/lu'

const solutionsdata = [
    {
        project: "DMCI AGENT WEBSITE",
        description: " DMCI Homes, Inc. is the real estate arm of DMCI Holdings through its wholly owned subsidiary DMCI Project Developers, Inc. (PDI).",
        link: "https://dmci-agent-website.vercel.app/",
        image: "/images/solutions/dmci-website.png",
    },

    {
        project: "ABIC MANPOWER",
        description: " ABIC Manpower Service Corp. specializes in providing staffing and recruitment solutions across the Philippines.",
        link: "https://abicmanpower.com/",
        image: "/images/solutions/abicmanpower.png",
    },

    {
        project: "ABIC REALTY",
        description: " ABIC Realty. provide property listings and cleaning services.",
        link: "https://abicrealtyph.com/",
        image: "/images/solutions/abic.png",
    },

    {
        project: "LELUXE CLINIC",
        description: " Le Luxe Clinic is a new modern type beauty clinic that will offer you the best beaty services such as nails, waxing, threading, warts removal, facial, RF, slimming, etc.",
        link: "https://leluxe-clinic.vercel.app/",
        image: "/images/solutions/leluxe.png",
    },
];

const SolutionsCard = () => {
    return (
        <div className='py-24'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                {solutionsdata.map((item, index) => (
                    <Card key={index} isFooterBlurred className="w-full h-[450px] border border-gray-500">
                        <Image
                            isZoomed
                            removeWrapper
                            alt="Relaxing app background"
                            className="z-0 w-full h-full object-fill"
                            src={item.image}
                        />
                        <CardFooter className="absolute bg-black/50 bottom-0 z-10 border-t-1 border-default-600 dark:border-default-100">
                            <div className="flex flex-grow gap-2 items-center">
                                <div className="flex flex-col max-w-xl">
                                    <p className="text-sm text-white/70 uppercase font-bold">{item.project}</p>
                                    <p className="text-sm text-white/60">
                                        {item.description}
                                    </p>
                                </div>
                            </div>
                            <Button as={Link} href={item.link} className='bg-accent text-blue-950' endContent={<LuArrowRight />} size="md">
                                View
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    )
}

export default SolutionsCard
