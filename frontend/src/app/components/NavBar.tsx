'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, CreditCard, BarChart, Target, Settings, LogOut } from 'lucide-react';
import styles from './NavBar.module.css';

export default function NavBar() {
  const pathname = usePathname();
  const router = useRouter();

  // Sidebar menu items
  const menuItems = [
    { name: 'Dashboard', path: '/pages/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Transactions', path: '/pages/transactions', icon: <CreditCard size={20} /> },
    { name: 'Analytics', path: '/pages/analytics', icon: <BarChart size={20} /> },
    { name: 'Goals', path: '/pages/goals', icon: <Target size={20} /> },
    { name: 'Settings', path: '/pages/settings', icon: <Settings size={20} />, isBottom: true },
  ];

  const handleLogout = () => {
    // Always clear the token to ensure the user is logged out
    localStorage.removeItem('token');
    
    // Do NOT clear the rememberedEmail or rememberMe flag
    // This allows the login page to auto-fill the email field next time
    
    // Redirect to login page
    router.push('/');
  };

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
        
        {/* Logout Button */}
        <li className={`${styles.navItem} ${styles.bottomItem} ${styles.logoutItem}`}>
          <button onClick={handleLogout} className={styles.logoutButton}>
            <LogOut size={20} />
            <span className={styles.navText}>Logout</span>
          </button>
        </li>
      </ul>
    </aside>
  );
}