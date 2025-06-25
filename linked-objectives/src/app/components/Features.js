import styles from '../styles/Features.module.css';

const features = [
  {
    title: 'Simple Goal Tracking',
    desc: 'Create and manage Objectives and Key Results with an intuitive interface.',
    img: '/photos/goalTracking.png'
  },
  {
    title: 'Real-Time Dashboards',
    desc: 'Track progress and alignment across individuals, teams, and departments.',
    img: '/photos/dashboard.png'
  },
  {
    title: 'Visual Strategy Mapping',
    desc: 'Connect and visualize OKRs with our integrated Excalidraw editor.',
    img: '/photos/strategyMap.png'
  },
  {
    title: 'Built for Teams',
    desc: 'Collaborate with clarity — manage users, roles, and visibility in just a few clicks.',
    img: '/photos/teams.png'
  }
];

export default function Features() {
  return (
    <section className={styles.features}>
      <h2><b>Key Features</b></h2>
      <div className={styles.list}>
        {features.map((f, i) => (
          <div key={i} className={styles.card}>
            <img src={f.img} alt={f.title} />
            <div className={styles.text}>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
