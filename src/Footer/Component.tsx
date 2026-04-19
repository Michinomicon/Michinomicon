import { getCachedGlobal } from '@/utilities/getGlobals'

import type { Footer as FooterType } from '@/payload-types'
import { CMSLink } from '@/components/Link'
import { getAppName } from '@/utilities/getAppName'
import ScrollToTopButton from '@/components/ScrollToTopButton'
import { AppMainLogo } from '@/components/AppMainLogo'
import { cn } from '@/lib/utils'

function FooterCMSLinks({ navItems }: { navItems: FooterType['navItems'] }) {
  if (!navItems) {
    return <></>
  }
  return (
    <div className="flex flex-col">
      <nav className="flex flex-row justify-center gap-4 lg:justify-end">
        {navItems.map(({ link }, i) => {
          return <CMSLink key={i} {...link} />
        })}
      </nav>
    </div>
  )
}

export async function Footer() {
  const footerData: FooterType = await getCachedGlobal('footer', 1)()
  const navItems = footerData?.navItems || []
  const appTitle: string = getAppName()

  const FooterStyles =
    'relative lg:h-(--footer-height) h-[calc(var(--footer-height)*2)] w-screen mt-auto z-20 border-t border-border bg-background rounded-none shadow-md pt-1'

  const FooterRowStyles =
    'mx-6 grid grid-cols-6 grid-rows-2 justify-center lg:grid-cols-12 lg:grid-rows-1 gap-3 rounded-none'

  const FooterSectionStyles =
    'col-span-6 rounded-none bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 justify-center flex flex-col align-middle'

  const FooterLeftSectionStyles = cn(FooterSectionStyles, 'lg:justify-start ')
  const FooterRightSectionStyles = cn(FooterSectionStyles, 'lg:justify-end')

  return (
    <footer className={cn(FooterStyles)}>
      <div className="absolute bottom-[calc(var(--footer-height)*2)] flex w-full flex-row flex-nowrap justify-center lg:bottom-(--footer-height)">
        <ScrollToTopButton className={'rounded-b-none border-b-0 border-border'} />
      </div>

      <div className={FooterRowStyles}>
        <div className={FooterLeftSectionStyles}>
          <AppMainLogo text={appTitle} className={'justify-center lg:justify-start'} />
        </div>

        <div className={FooterRightSectionStyles}>
          <FooterCMSLinks navItems={navItems} />
        </div>
      </div>
    </footer>
  )
}
