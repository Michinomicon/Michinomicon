import { useIsMobile } from '@/hooks/use-mobile'
import HeaderNavMenu, { NavMenuProps } from './HeaderNavMenu'
import MobileNavMenu, { MobileMenuProps } from './MobileNavMenu'

export default function NavMenu({ appTitle, navTree }: NavMenuProps & MobileMenuProps) {
  const isMobile = useIsMobile()
  return isMobile ? (
    <MobileNavMenu appTitle={appTitle} navTree={navTree} />
  ) : (
    <HeaderNavMenu navTree={navTree} />
  )
}
