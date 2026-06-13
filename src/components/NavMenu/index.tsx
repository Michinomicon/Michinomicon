import { useIsMobile } from '@/hooks/use-mobile'
import HeaderNavMenu, { NavMenuProps } from './HeaderNavMenu'
import MobileNavMenu, { MobileMenuProps } from './MobileNavMenu'

export default function NavMenu({ appTitle, menuTree }: NavMenuProps & MobileMenuProps) {
  const isMobile = useIsMobile()
  return isMobile ? (
    <MobileNavMenu appTitle={appTitle} menuTree={menuTree} />
  ) : (
    <HeaderNavMenu menuTree={menuTree} />
  )
}
