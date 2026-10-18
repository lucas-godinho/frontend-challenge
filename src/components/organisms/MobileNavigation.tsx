import {
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Heart, House, UserRound } from "lucide-react";
import { cn } from "@/lib/cn";

const NAV_HEIGHT = 126;
const NAV_PADDING_X = 20;
const TAB_COUNT = 5;
const DEFAULT_NAV_WIDTH = 390;

const BAR_TOP = 31;
const BAR_TOP_RADIUS = 8;
const BAR_BOTTOM_RADIUS = 28;

const SCANNER_SIZE = 65;
const SCANNER_CUTOUT_RADIUS = 42;
const CUTOUT_MARGIN = SCANNER_CUTOUT_RADIUS - SCANNER_SIZE / 2;
const CIRCLE_CENTER_Y = SCANNER_SIZE / 2;

const TAB_ROW_TOP = 58;
const TAB_ROW_HEIGHT = 40;
const ICON_LIFT = TAB_ROW_TOP + TAB_ROW_HEIGHT / 2 - CIRCLE_CENTER_Y;

const TAB_CIRCLE_MAX = 52;
const TAB_CIRCLE_MIN = 40;
const SCANNER_GAP = 6;

type NavGeometry = {
  barPath: string;
  tabCircleSize: number;
  tabCutoutRadius: number;
  tabCenterX: (index: number) => number;
};

function getNavGeometry(navWidth: number): NavGeometry {
  const columnWidth = (navWidth - NAV_PADDING_X * 2) / TAB_COUNT;
  const maxFittingSize = (columnWidth - SCANNER_SIZE / 2 - SCANNER_GAP) * 2;
  const tabCircleSize = Math.round(
    Math.min(TAB_CIRCLE_MAX, Math.max(TAB_CIRCLE_MIN, maxFittingSize)),
  );

  const barPath = [
    `M ${BAR_TOP_RADIUS} ${BAR_TOP}`,
    `H ${navWidth - BAR_TOP_RADIUS}`,
    `Q ${navWidth} ${BAR_TOP} ${navWidth} ${BAR_TOP + BAR_TOP_RADIUS}`,
    `V ${NAV_HEIGHT - BAR_BOTTOM_RADIUS}`,
    `Q ${navWidth} ${NAV_HEIGHT} ${navWidth - BAR_BOTTOM_RADIUS} ${NAV_HEIGHT}`,
    `H ${BAR_BOTTOM_RADIUS}`,
    `Q 0 ${NAV_HEIGHT} 0 ${NAV_HEIGHT - BAR_BOTTOM_RADIUS}`,
    `V ${BAR_TOP + BAR_TOP_RADIUS}`,
    `Q 0 ${BAR_TOP} ${BAR_TOP_RADIUS} ${BAR_TOP}`,
    "Z",
  ].join(" ");

  return {
    barPath,
    tabCircleSize,
    tabCutoutRadius: tabCircleSize / 2 + CUTOUT_MARGIN,
    tabCenterX: (index) => NAV_PADDING_X + columnWidth * (index + 0.5),
  };
}

type LinkTab = {
  kind: "link";
  to: "/" | "/favorites" | "/cart" | "/profile";
  label: string;
  icon: ReactNode;
  dataTab: "home" | "favorites" | "cart" | "profile";
  activeAnimation: string;
};

type ActionTab = {
  kind: "action";
  id: "scanner";
  label: string;
  icon: ReactNode;
};

type NavTab = LinkTab | ActionTab;

function CartIcon() {
  return (
    <svg
      width="16"
      height="15"
      viewBox="0 0 18 17"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M17.5 5.13468L16.5564 11.1111C16.3848 12.2896 15.4412 13.0471 14.2402 13.0471H6.0049C4.88971 13.0471 3.86029 12.2054 3.68873 11.1111L2.65931 4.12458L2.40196 2.18855C2.31618 1.6835 1.88725 1.3468 1.28676 1.3468H0.686274C0.343137 1.3468 0 1.0101 0 0.673401C0 0.3367 0.343137 0 0.686274 0H1.28676C2.48775 0 3.51716 0.841751 3.60294 2.0202L3.77451 3.367H15.9559C16.3848 3.367 16.8137 3.53535 17.0711 3.87205C17.4142 4.20876 17.5 4.71381 17.5 5.13468Z"
        fill="currentColor"
      />
      <path
        d="M14.4118 16.6667C14.8855 16.6667 15.2696 16.2898 15.2696 15.8249C15.2696 15.36 14.8855 14.9832 14.4118 14.9832C13.938 14.9832 13.5539 15.36 13.5539 15.8249C13.5539 16.2898 13.938 16.6667 14.4118 16.6667Z"
        fill="currentColor"
      />
      <path
        d="M5.83333 16.6667C6.30711 16.6667 6.69118 16.2898 6.69118 15.8249C6.69118 15.36 6.30711 14.9832 5.83333 14.9832C5.35956 14.9832 4.97549 15.36 4.97549 15.8249C4.97549 16.2898 5.35956 16.6667 5.83333 16.6667Z"
        fill="currentColor"
      />
    </svg>
  );
}

function CenterActionIcon() {
  return (
    <svg
      width="27"
      height="24"
      viewBox="0 0 27 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M13.3819 12.8913C9.28498 12.8913 5.18803 12.8913 1.09108 12.8906C0.961448 12.8906 0.827342 12.8943 0.702176 12.8667C0.25441 12.7684 -0.0480741 12.337 0.00631347 11.893C0.060701 11.4482 0.439924 11.1114 0.913021 11.1092C1.98364 11.1032 3.055 11.1062 4.12561 11.1062C11.3234 11.1062 18.5212 11.107 25.719 11.1084C25.8575 11.1084 26.0013 11.1047 26.1347 11.136C26.5743 11.2396 26.8641 11.6553 26.8179 12.0919C26.7702 12.5389 26.3947 12.8868 25.9246 12.8891C24.7139 12.8965 23.504 12.8928 22.2933 12.8928C19.3228 12.8928 16.3524 12.8928 13.3827 12.8928C13.3819 12.8928 13.3819 12.8921 13.3819 12.8913Z"
        fill="currentColor"
      />
      <path
        d="M10.5553 24.0002C9.20453 23.7976 7.81951 23.7216 6.51123 23.3654C3.76503 22.6167 2.19524 20.7243 1.7445 17.9274C1.57761 16.8926 1.47479 15.8473 1.35559 14.8057C1.28332 14.1762 1.58357 13.7634 2.13191 13.6956C2.67653 13.6286 3.07587 13.9817 3.13622 14.5278C3.26586 15.708 3.35601 16.8978 3.57877 18.0615C3.98109 20.1633 5.70212 21.6288 7.83664 21.8165C8.84617 21.9052 9.8542 22.0177 10.8607 22.1339C11.5953 22.2188 11.9343 23.0347 11.4948 23.6314C11.3048 23.89 11.0805 23.9637 10.5553 24.0002Z"
        fill="currentColor"
      />
      <path
        d="M25.4463 9.39819C25.4307 9.53528 25.4321 9.67758 25.3949 9.8087C25.3077 10.1186 25.0015 10.3779 24.7422 10.3831C24.3004 10.3921 23.7998 10.0643 23.6977 9.65001C23.6247 9.35572 23.6225 9.0443 23.5822 8.74107C23.4571 7.78444 23.3967 6.81366 23.1881 5.87566C22.7604 3.95571 21.5326 2.73758 19.6142 2.32259C18.4743 2.07599 17.2971 1.99999 16.1363 1.84726C16.0075 1.83013 15.8756 1.82417 15.7504 1.79213C15.331 1.68559 15.0583 1.287 15.1112 0.870521C15.17 0.407854 15.5269 0.0539627 15.9732 0.0859992C17.5042 0.195519 19.0427 0.30653 20.5119 0.776646C22.8633 1.52988 24.3451 3.15778 24.9054 5.53965C25.2012 6.79876 25.3018 8.10332 25.4903 9.38701C25.4761 9.39148 25.4612 9.39446 25.4463 9.39819Z"
        fill="currentColor"
      />
      <path
        d="M25.4224 14.8807C25.2988 16.1673 25.2086 17.5807 24.8167 18.9441C24.0777 21.5145 21.8962 23.2891 19.2372 23.5491C18.1554 23.6549 17.0781 23.8106 15.9992 23.944C15.617 23.9917 15.2013 23.6229 15.1208 23.1647C15.0404 22.7058 15.3287 22.255 15.7832 22.1939C16.3263 22.1202 16.8776 22.106 17.4208 22.033C18.3223 21.913 19.2565 21.8803 20.1133 21.6083C21.97 21.0197 23.007 19.6638 23.279 17.7453C23.4235 16.7254 23.5308 15.7002 23.6336 14.675C23.6932 14.082 24.0799 13.6685 24.6007 13.6983C25.1043 13.7273 25.4515 14.1744 25.4224 14.8807Z"
        fill="currentColor"
      />
      <path
        d="M1.3295 9.27513C1.52768 7.95493 1.62081 6.60791 1.9449 5.319C2.60053 2.71063 4.34912 1.11849 6.95898 0.532893C8.1339 0.269151 9.34756 0.177512 10.5448 0.0173291C10.7266 -0.00725703 10.9226 -0.0087471 11.0984 0.0329749C11.5119 0.130574 11.7548 0.509797 11.7153 0.940427C11.6736 1.39117 11.3681 1.69068 10.9285 1.73985C9.84748 1.86055 8.7642 1.97081 7.68688 2.1228C5.4108 2.44316 3.83356 4.02338 3.52363 6.28456C3.37536 7.36933 3.2569 8.45857 3.1295 9.54632C3.07809 9.98441 2.70185 10.3122 2.24217 10.3063C1.79589 10.3003 1.41518 9.94492 1.39059 9.50833C1.38612 9.43457 1.38985 9.36007 1.38985 9.28556C1.36973 9.28184 1.34961 9.27886 1.3295 9.27513Z"
        fill="currentColor"
      />
    </svg>
  );
}

const TABS: readonly NavTab[] = [
  {
    kind: "link",
    to: "/",
    label: "Início",
    dataTab: "home",
    icon: <House size={16} fill="currentColor" />,
    activeAnimation: "animate-nav-home-select",
  },
  {
    kind: "link",
    to: "/favorites",
    label: "Favoritos",
    dataTab: "favorites",
    icon: <Heart size={16} fill="currentColor" />,
    activeAnimation: "animate-nav-heart-select",
  },
  {
    kind: "action",
    id: "scanner",
    label: "Scanner de NFTs",
    icon: <CenterActionIcon />,
  },
  {
    kind: "link",
    to: "/cart",
    label: "Carrinho",
    dataTab: "cart",
    icon: <CartIcon />,
    activeAnimation: "animate-nav-cart-select",
  },
  {
    kind: "link",
    to: "/profile",
    label: "Perfil",
    dataTab: "profile",
    icon: <UserRound size={16} fill="currentColor" />,
    activeAnimation: "animate-nav-profile-select",
  },
];

function isRouteActive(to: LinkTab["to"], pathname: string): boolean {
  return to === "/"
    ? pathname === "/"
    : pathname === to || pathname.startsWith(`${to}/`);
}

const navStyle = { "--nav-icon-lift": `${ICON_LIFT}px` } as CSSProperties;
const gridStyle: CSSProperties = {
  paddingInline: NAV_PADDING_X,
  paddingTop: TAB_ROW_TOP,
  paddingBottom: NAV_HEIGHT - TAB_ROW_TOP - TAB_ROW_HEIGHT,
};

const raisedItemClass =
  "text-foreground [&_svg]:-translate-y-[var(--nav-icon-lift)] [&_svg]:scale-[1.08] [&_svg]:[filter:drop-shadow(0_2px_5px_rgb(232_155_85_/_28%))]";

const itemClass =
  'relative z-[2] grid h-10 w-full touch-manipulation place-items-center border-0 bg-transparent p-0 text-[#cfb28c] transition-colors duration-[620ms] ease-nav after:absolute after:inset-x-0 after:-inset-y-0.5 after:content-[""] focus-visible:outline-2 focus-visible:outline-foreground focus-visible:outline-offset-3 [&_svg]:transition-[transform,filter] [&_svg]:duration-[620ms] [&_svg]:ease-nav';
const circleSurfaceClass =
  "bg-[linear-gradient(180deg,rgb(210_138_76_/_40%)_-16.92%,#d28a4c_109.23%)] shadow-[0_5px_16px_rgb(0_0_0_/_30%)]";

export function MobileNavigation() {
  const pathname = useRouterState({
    select: (state: { location: { pathname: string } }): string =>
      state.location.pathname,
  });
  const navRef = useRef<HTMLElement>(null);
  const maskId = `${useId().replace(/:/g, "")}-nav-mask`;
  const [navWidth, setNavWidth] = useState<number>(DEFAULT_NAV_WIDTH);

  const geometry = useMemo(() => getNavGeometry(navWidth), [navWidth]);
  const activeIndex = useMemo(
    () =>
      TABS.findIndex(
        (tab) => tab.kind === "link" && isRouteActive(tab.to, pathname),
      ),
    [pathname],
  );
  const activeCenterX =
    activeIndex === -1 ? null : geometry.tabCenterX(activeIndex);

  useLayoutEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const measure = () => {
      if (nav.clientWidth > 0) setNavWidth(nav.clientWidth);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(nav);
    return () => observer.disconnect();
  }, []);

  return (
    <nav
      ref={navRef}
      style={navStyle}
      className="fixed inset-x-[15px] bottom-[env(safe-area-inset-bottom,0px)] isolate z-10 h-[126px] select-none text-[#cfb28c] min-[761px]:hidden"
      aria-label="Navegação mobile"
    >
      <svg
        className="pointer-events-none absolute inset-0 z-0 h-[126px] w-full overflow-visible [filter:drop-shadow(0_-10px_15px_rgb(10_6_4_/_45%))]"
        viewBox={`0 0 ${navWidth} ${NAV_HEIGHT}`}
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <mask
            id={maskId}
            x="0"
            y="0"
            width={navWidth}
            height={NAV_HEIGHT}
            maskUnits="userSpaceOnUse"
            maskContentUnits="userSpaceOnUse"
          >
            <rect width={navWidth} height={NAV_HEIGHT} fill="black" />
            <path d={geometry.barPath} fill="white" />
            <circle
              cx={navWidth / 2}
              cy={BAR_TOP}
              r={SCANNER_CUTOUT_RADIUS}
              fill="black"
            />
            {activeCenterX !== null && (
              <circle
                key={activeIndex}
                className="[transform-box:fill-box] [transform-origin:center] animate-nav-cutout-enter"
                cx={activeCenterX}
                cy={BAR_TOP}
                r={geometry.tabCutoutRadius}
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          width={navWidth}
          height={NAV_HEIGHT}
          fill="#241612"
          mask={`url(#${maskId})`}
        />
      </svg>

      {activeCenterX !== null && (
        <span
          key={activeIndex}
          className="pointer-events-none absolute z-[1]"
          style={{
            left: activeCenterX - geometry.tabCircleSize / 2,
            top: CIRCLE_CENTER_Y - geometry.tabCircleSize / 2,
            width: geometry.tabCircleSize,
            height: geometry.tabCircleSize,
          }}
          aria-hidden="true"
        >
          <span
            className={cn(
              "block size-full rounded-full animate-nav-highlight-enter",
              circleSurfaceClass,
            )}
          />
        </span>
      )}

      <span
        className={cn(
          "pointer-events-none absolute left-1/2 top-0 z-[1] -translate-x-1/2 rounded-full",
          circleSurfaceClass,
        )}
        style={{ width: SCANNER_SIZE, height: SCANNER_SIZE }}
        aria-hidden="true"
      />

      <div
        className="absolute inset-0 z-[2] grid grid-cols-5 items-center"
        style={gridStyle}
      >
        {TABS.map((tab, index) => {
          if (tab.kind === "action") {
            return (
              <button
                key={tab.id}
                type="button"
                className={cn(
                  itemClass,
                  raisedItemClass,
                  "cursor-default disabled:opacity-100",
                )}
                aria-label={`${tab.label} (em breve)`}
                disabled
              >
                {tab.icon}
              </button>
            );
          }
          const isActive = index === activeIndex;
          return (
            <Link
              key={tab.to}
              to={tab.to}
              className={cn(
                itemClass,
                isActive && raisedItemClass,
                isActive && tab.activeAnimation,
              )}
              data-tab={tab.dataTab}
              aria-label={tab.label}
              aria-current={isActive ? "page" : undefined}
            >
              {tab.icon}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
