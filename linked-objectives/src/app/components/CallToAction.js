import styles from '../styles/CallToAction.module.css';
import Link from 'next/link';

export default function CallToAction() {
  return (
    <section className={styles.cta}>
      <h2><b>Ready to align your strategy and drive real results?</b></h2>
      <p>Start managing OKRs with clarity — for free.</p>
      <div className={styles.buttons}>
        <Link href="/login">
          <button className={styles.login}>Log In</button>
        </Link>
      </div>
    </section>
  );
}
