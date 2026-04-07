'use client'

import { Palette } from 'lucide-react'

import { useTheme } from '.'
import { ModeToggle } from './mode-toggle'
import { useWallpaper } from '../Wallpaper'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu'
import {
  Field,
  FieldContent,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
} from '@/components/ui/field'
import { Switch } from '@/components/ui/switch'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

const themes: Array<{ id: string; label: string }> = [
  { id: 'default', label: 'Default' },
  { id: 'simple', label: 'Simple' },
  { id: 'purple', label: 'Purple' },
  // { id: 'minimal-red', label: 'Minimal Red' },
  // { id: 'minimal-rose', label: 'Minimal Rose' },
  // { id: 'minimal-orange', label: 'Minimal Orange' },
  // { id: 'minimal-green', label: 'Minimal Green' },
  // { id: 'minimal-blue', label: 'Minimal Blue' },
  // { id: 'minimal-yellow', label: 'Minimal Yellow' },
  // { id: 'minimal-violet', label: 'Minimal Violet' },
  // { id: 'blue', label: 'Blue' },
]

export function ColorThemeToggle() {
  const { colorTheme, setColorTheme } = useTheme()
  const { globalSpotlight, globalReactiveTile, setSpotlight, setReactiveTile } = useWallpaper()

  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger className="text-primary flex gap-2">
            <Palette /> Theme
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="flex flex-col w-50 m-2">
              <FieldGroup>
                <FieldSet>
                  <FieldGroup>
                    <Field>
                      <FieldContent className="flex flex-row justify-center">
                        <ModeToggle />
                      </FieldContent>
                    </Field>
                  </FieldGroup>
                </FieldSet>

                <FieldSeparator></FieldSeparator>

                <FieldSet>
                  <FieldLegend>Themes</FieldLegend>
                  <RadioGroup defaultValue={colorTheme ?? undefined} onValueChange={setColorTheme}>
                    {themes.map((theme, index) => (
                      <FieldLabel key={index} htmlFor={theme.id}>
                        <Field orientation="horizontal">
                          <FieldContent data-theme={theme.id}>
                            <div className="flex items-center gap-2 p-2">
                              <div className="flex items-center justify-center space-x-0 rounded-full border-accent border-2 outline-0">
                                <div className="w-3 h-6 bg-primary rounded-l-full rounded-r-0 outline-0"></div>
                                <div className="w-3 h-6 bg-secondary rounded-l-0 rounded-r-full outline-0"></div>
                              </div>
                              <span>{theme.label}</span>
                            </div>
                          </FieldContent>
                          <RadioGroupItem id={theme.id} value={theme.id} />
                        </Field>
                      </FieldLabel>
                    ))}
                  </RadioGroup>
                </FieldSet>

                <FieldSeparator></FieldSeparator>

                <FieldSet>
                  <FieldLegend>Wallpaper</FieldLegend>
                  <FieldGroup>
                    <FieldLabel htmlFor="switch-wallpaper-spotlight">
                      <Field orientation="horizontal" className="flex justify-between px-2">
                        <FieldContent>
                          <FieldTitle>Spotlight</FieldTitle>
                        </FieldContent>

                        <Checkbox
                          id="switch-wallpaper-spotlight"
                          name="Spotlight Effect"
                          checked={globalSpotlight}
                          onCheckedChange={setSpotlight}
                        />
                      </Field>
                    </FieldLabel>
                    <FieldLabel htmlFor="switch-wallpaper-reactive-colors">
                      <Field orientation="horizontal" className="flex justify-between px-2">
                        <FieldContent>
                          <FieldTitle>Reactive Colours</FieldTitle>
                        </FieldContent>
                        <Checkbox
                          id="switch-wallpaper-reactive-colors"
                          name="Reactive Colours"
                          checked={globalReactiveTile}
                          onCheckedChange={setReactiveTile}
                        />
                      </Field>
                    </FieldLabel>
                  </FieldGroup>
                </FieldSet>
              </FieldGroup>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )

  // return (
  //   <ButtonGroup>
  //     {/* <ButtonGroup>
  //       <ModeToggle />
  //     </ButtonGroup>
  //     <ButtonGroupSeparator /> */}
  //     <ButtonGroup>
  //       <DropdownMenu>
  //         <DropdownMenuTrigger asChild>
  //           <Button variant="outline" size="sm">
  //             <Palette /> Theme
  //           </Button>
  //         </DropdownMenuTrigger>
  //         <DropdownMenuContent align="end">
  //           <DropdownMenuGroup>
  //             <ModeToggle />
  //           </DropdownMenuGroup>
  //           <DropdownMenuSeparator />
  //           <DropdownMenuGroup>
  //             <DropdownMenuLabel>Themes</DropdownMenuLabel>
  //             {themes.map((theme) => (
  //               <DropdownMenuItem
  //                 key={theme.id}
  //                 onClick={() => setColorTheme(theme.id)}
  //                 className="flex items-center gap-2"
  //                 data-theme={theme.id}
  //               >
  //                 <div className="flex items-center gap-2 p-2">
  //                   <div className="flex items-center justify-center space-x-0 rounded-full border-accent border-2 outline-0">
  //                     <div className="w-3 h-6 bg-primary rounded-l-full rounded-r-0 outline-0"></div>
  //                     <div className="w-3 h-6 bg-secondary rounded-l-0 rounded-r-full outline-0"></div>
  //                   </div>
  //                   <span>{theme.label}</span>
  //                 </div>
  //               </DropdownMenuItem>
  //             ))}
  //           </DropdownMenuGroup>
  //           <DropdownMenuSeparator />
  //           <DropdownMenuGroup>
  //             <DropdownMenuLabel>Wallpaper Effects</DropdownMenuLabel>
  //             <DropdownMenuCheckboxItem checked={globalSpotlight} onCheckedChange={setSpotlight}>
  //               Spotlight
  //             </DropdownMenuCheckboxItem>
  //             <DropdownMenuCheckboxItem
  //               checked={globalReactiveTile}
  //               onCheckedChange={setReactiveTile}
  //             >
  //               Reactive Colours
  //             </DropdownMenuCheckboxItem>
  //           </DropdownMenuGroup>
  //         </DropdownMenuContent>
  //       </DropdownMenu>
  //     </ButtonGroup>
  //   </ButtonGroup>
  // )
}
