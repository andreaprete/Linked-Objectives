import styles from '../styles/HowItWorks.module.css';

export default function HowItWorks() {
  return (
    <section className={styles.how}>
      <h2>How It Works</h2>
      <ol className={styles.steps}>
        <li>
          <strong>1. Sign Up & Create Your Profile</strong>
          <p>Join your team or department and get started in minutes.</p>
        </li>
        <li>
          <strong>2. Set Objectives & Key Results</strong>
          <p>Align goals with your company strategy and assign team OKRs.</p>
        </li>
        <li>
          <strong>3. Visualize Progress</strong>
          <p>Use the Dashboard and Strategy Map to track performance and stay aligned.</p>
        </li>
        <li>
          <strong>4. Reach Your Targets</strong>
          <p>Measure what matters. Adjust. Achieve.</p>
        </li>
      </ol>
    </section>
  );
}
