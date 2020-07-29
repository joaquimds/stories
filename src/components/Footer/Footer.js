import styles from './Footer.module.scss'

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <p>
        Made by{' '}
        <a
          href="https://twitter.com/joaquimds"
          target="_blank"
          rel="noopener noreferrer"
        >
          @joaquimds
        </a>
      </p>
    </footer>
  )
}

export default Footer
