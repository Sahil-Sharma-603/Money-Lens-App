'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, CreditCard, BarChart, Target, Settings } from 'lucide-react';
import styles from './NavBar.module.css';

export default function NavBar() {
  const pathname = usePathname();

  // Sidebar menu items
  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Transactions', path: '/transactions', icon: <CreditCard size={20} /> },
    { name: 'Analytics', path: '/analytics', icon: <BarChart size={20} /> },
    { name: 'Goals', path: '/goals', icon: <Target size={20} /> },
    { name: 'Settings', path: '/settings', icon: <Settings size={20} />, isBottom: true }, // Settings is moved to bottom
  ];

  return (
    <aside className={styles.sidebar}>
      {/* Logo */}
      <div className={styles.logo}>MoneyLens</div>

      {/* Navigation Links */}
      <ul className={styles.navLinks}>
        {menuItems.map((item) => (
          <li key={item.name} className={`${styles.navItem} ${pathname === item.path ? styles.active : ''} ${item.isBottom ? styles.bottomItem : ''}`}>
            <Link href={item.path}>
              {item.icon}
              <span>{item.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
