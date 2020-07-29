import Link from 'next/link'

const Navbar = () => {
  return (
    <nav className="navbar">
      <Link href="/">
        <a className="navbar__logo">
          <img src="/tree.png" alt={process.env.title} />
          <span>{process.env.title}</span>
        </a>
      </Link>
      <ul className="navbar__links">
        <li>
          <Link href="/about">
            <a>About</a>
          </Link>
        </li>
      </ul>
      <div className="navbar__auth">
        <a href="/login">Login</a>
      </div>
    </nav>
  )
}

export default Navbar
