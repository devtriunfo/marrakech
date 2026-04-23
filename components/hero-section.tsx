"use client"

import Image from 'next/image'
import { ArrowDown } from 'lucide-react'
import { Button } from '@/components/ui/button'

type HeroSectionProps = {
  onExploreClick: () => void
}

export function HeroSection({ onExploreClick }: HeroSectionProps) {
  return (
    <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
      {/* Background Video */}
      <div className="absolute inset-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover object-center"
        >
          <source src="/hero-video.mp4" type="video/mp4" />
        </video>
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/50" />
      </div>

      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <div className="mb-8">
            <Image
              src="/logo.png"
              alt="Marrakech Tabacaria"
              width={400}
              height={150}
              className="mx-auto h-[150px] w-auto"
              priority
            />
          </div>

          <p className="text-lg md:text-xl text-muted-foreground mb-2">
            Experiência premium em produtos para fumo
          </p>

          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="h-px w-16 bg-primary/50" />
            <span className="text-primary text-sm tracking-widest uppercase">Desde 2020</span>
            <div className="h-px w-16 bg-primary/50" />
          </div>

          <p className="text-muted-foreground max-w-xl mx-auto mb-8">
            Oferecemos os melhores produtos do mercado: sedas, piteiras artesanais, 
            narguiles, tabacos importados e muito mais. Qualidade e atendimento 
            diferenciado para você.
          </p>

          <Button
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8"
            onClick={onExploreClick}
          >
            Ver Produtos
            <ArrowDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
    </section>
  )
}
