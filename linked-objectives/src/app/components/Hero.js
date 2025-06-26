"use client"
import styles from '../styles/Hero.module.css';
import Link from 'next/link';

export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.container}>
        <div className={styles.text}>
          <h1>#1 Open-Source OKR Tool</h1>
          <p>
            Align everyone with the strategy. Identify KPIs & OKRs with the highest impact.
            Keep everyone focused and accountable to turn goals into results.
          </p>
          <div className={styles.buttons}>
            <Link href="/login">
            <button className={styles.signup}>Log In</button>
            </Link>
          </div>
        </div>
        <div className={styles.imageWrapper}>
          <img src="/photos/hero.png" alt="App Preview" />
        </div>
      </div>
    </section>
  );
}
