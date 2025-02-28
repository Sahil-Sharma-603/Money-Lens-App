import styles from '../assets/page.module.css';

export default function Card({ children, className, style }: { 
  children?: React.ReactNode; 
  className?: string; 
  style?: React.CSSProperties;
}) {
  return <div className={`${styles.card} ${className || ''}`} style={style}>{children}</div>;
}
