import { useMemo } from 'react'
import { Link, useRouterState } from '@tanstack/react-router'
import { Menu } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { type TopNavLink } from '../types'

type TopNavProps = React.HTMLAttributes<HTMLElement> & {
  links: TopNavLink[]
}

/**
 * 顶部导航栏组件
 * 在大屏幕显示水平导航，在小屏幕显示下拉菜单
 */
export function TopNav({ className, links, ...props }: TopNavProps) {
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  // 规范化链接，确保所有可选属性都有默认值
  const normalizedLinks = useMemo(
    () =>
      links.map((link) => ({
        isActive: pathname === link.href,
        disabled: false,
        external: false,
        ...link,
      })),
    [links, pathname]
  )

  return (
    <>
      {/* 移动端下拉菜单 */}
      <div className='lg:hidden'>
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button size='icon' variant='outline' className='size-7'>
              <Menu />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side='bottom' align='start'>
            {normalizedLinks.map(
              ({ title, href, isActive, disabled, external }) => (
                <DropdownMenuItem key={`${title}-${href}`} asChild>
                  {external ? (
                    <a
                      href={href}
                      target='_blank'
                      rel='noopener noreferrer'
                      className={!isActive ? 'text-muted-foreground' : ''}
                    >
                      {title}
                    </a>
                  ) : (
                    <Link
                      to={href}
                      className={!isActive ? 'text-muted-foreground' : ''}
                      disabled={disabled}
                    >
                      {title}
                    </Link>
                  )}
                </DropdownMenuItem>
              )
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* 桌面端水平导航 */}
      <nav
        className={cn(
          'hidden items-center space-x-4 lg:flex lg:space-x-4 xl:space-x-6',
          className
        )}
        {...props}
      >
        {normalizedLinks.map(({ title, href, isActive, disabled, external }) =>
          external ? (
            <a
              key={`${title}-${href}`}
              href={href}
              target='_blank'
              rel='noopener noreferrer'
              className='rounded-lg px-3 py-1.5 text-sm font-normal text-muted-foreground transition-colors duration-200 hover:text-foreground'
            >
              {title}
            </a>
          ) : (
            <Link
              key={`${title}-${href}`}
              to={href}
              disabled={disabled}
              className={cn(
                'relative rounded-lg px-3 py-1.5 text-sm font-normal transition-colors duration-200',
                isActive
                  ? 'bg-[#D3DFFF] text-foreground dark:bg-[#8164FF]/15'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {title}
              {isActive && (
                <span className='pointer-events-none absolute -bottom-px inset-x-3 h-0.5 rounded-full bg-linear-to-b from-[#89BDF9] to-[#8164FF]' />
              )}
            </Link>
          )
        )}
      </nav>
    </>
  )
}
