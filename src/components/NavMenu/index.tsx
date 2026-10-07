import { useIsMobile } from '@/hooks/use-mobile'
import HeaderNavMenu, { NavMenuProps } from './HeaderNavMenu'
import MobileNavMenu, { MobileNavMenuProps } from './MobileNavMenu'

export default function NavMenu({
  appTitle,
  menuItems: menuTree,
}: NavMenuProps & MobileNavMenuProps) {
  const isMobile = useIsMobile()
  return isMobile ? (
    <MobileNavMenu appTitle={appTitle} menuItems={menuTree} />
  ) : (
    <HeaderNavMenu menuItems={menuTree} />
  )
}
