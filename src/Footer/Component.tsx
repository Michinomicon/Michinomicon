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
    <div className="flex flex-col-reverse items-start md:flex-row gap-4 md:items-center">
      <nav className="flex flex-col md:flex-row gap-4">
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
    'relative h-(--footer-height) w-screen mt-auto z-20 border-t border-border bg-background rounded-none shadow-md'

  const FooterRowStyles = 'p-1 mx-6 grid grid-cols-12 grid-rows-1 gap-3 rounded-none'

  const FooterSectionStyles =
    'px-2 gap-2 flex flex-col md:flex-row justify-center md:justify-center flex-nowrap rounded-none bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60'

  const FooterCenterSectionStyles = cn(FooterSectionStyles, 'container col-span-8')
  const FooterLeftSectionStyles = cn(FooterSectionStyles, 'col-span-2 ') //justify-start
  const FooterRightSectionStyles = cn(FooterSectionStyles, 'col-span-2 ') //justify-end

  return (
    <footer className={FooterStyles}>
      <div className={FooterRowStyles}>
        <div className={FooterLeftSectionStyles}>
          <AppMainLogo text={appTitle} />
        </div>

        <div className={FooterCenterSectionStyles}>
          <div className="absolute -top-[calc(calc(50%)+0.1em)]">
            <ScrollToTopButton />
          </div>
        </div>

        <div className={FooterRightSectionStyles}>
          <FooterCMSLinks navItems={navItems} />
        </div>
      </div>
    </footer>
  )
}
