import { useIsMobile } from '@/hooks/use-mobile'
import HeaderNavMenu, { NavMenuProps } from './HeaderNavMenu'
import MobileNavMenu, { MobileMenuProps } from './MobileNavMenu'

export default function NavMenu({ appTitle, menuItems: menuTree }: NavMenuProps & MobileMenuProps) {
  const isMobile = useIsMobile()
  return isMobile ? (
    <MobileNavMenu appTitle={appTitle} menuItems={menuTree} />
  ) : (
    <HeaderNavMenu menuItems={menuTree} />
  )
}
