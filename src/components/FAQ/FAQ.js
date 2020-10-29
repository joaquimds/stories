import Link from 'next/link'

import styles from './FAQ.module.scss'

const FAQ = () => {
  const content = [
    {
      question: 'What is this website for?',
      answer: (
        <p>
          Tree of Tales is a free online tool for reading and writing
          collaborative, non-linear fiction.
        </p>
      ),
    },
    {
      question: 'How do I read existing stories?',
      answer: (
        <>
          <p>
            Begin reading a story by choosing a beginning fragment on the right
            hand side of the{' '}
            <Link href="/">
              <a>home page</a>
            </Link>{' '}
            (or the bottom of the page on mobile). Repeat this process to add
            further fragments to the story.
          </p>
          <p>
            View completed stories by visiting the{' '}
            <Link href="/library">
              <a>library</a>
            </Link>
            .
          </p>
        </>
      ),
    },
    {
      question: 'How do I create a new story?',
      answer: (
        <p>
          Start a new story by submitting a new beginning fragment on the{' '}
          <Link href="/">
            <a>home page</a>
          </Link>
          .
        </p>
      ),
    },
    {
      question: 'How do I add to an existing story?',
      answer: (
        <p>
          Write and submit your proposed next fragment while viewing the story
          you wish to add to. For example, you can add to the story I was using
          to test this website{' '}
          <Link href="/2">
            <a>here</a>
          </Link>
          .
        </p>
      ),
    },
    {
      question: 'How do I save a story in the library?',
      answer: (
        <p>
          Stories are added to the library when they are given a title. A{' '}
          {'"title"'} button should appear at the bottom of any story that ends
          with a fragment written by you. Click this button and submit a title
          to save the story in the library.
        </p>
      ),
    },
    {
      question: 'Can I export my work?',
      answer: (
        <p>
          Any story can be downloaded using the {'"download"'} button, found at
          the bottom of the story text.
        </p>
      ),
    },
    {
      question: 'How do I see all the fragments I have written?',
      answer: (
        <p>
          You can view these from your account page,{' '}
          <Link href="/account/fragments">
            <a>here</a>
          </Link>
          .
        </p>
      ),
    },
    {
      question: 'Can I edit or delete my fragments?',
      answer: (
        <p>
          You can edit your fragments, but only while no other user has saved it
          or used it in their own story. You can always delete your fragments.
        </p>
      ),
    },
    {
      question: 'How do I bookmark or "like" a story?',
      answer: (
        <>
          <p>
            Once you have an account you can add any story to your favourites.
            Simply click the {'"favourite"'}
            button at the bottom of the story.
          </p>
          <p>
            You can view all your favourites from your account page,{' '}
            <Link href="/account/favourites">
              <a>here</a>
            </Link>
            .
          </p>
        </>
      ),
    },
    {
      question: 'How do I link stories together?',
      answer: (
        <>
          <p>
            Any story can be linked to any other. Select the {'"Link"'} tab
            found at the top of the form used to submit content. You can either
            search for the fragment you wish to connect to or navigate the tree
            using the {'"trace back"'} and {'"check ahead"'} buttons.
          </p>
          <p>
            Once you have found the fragment you are looking for, select it to
            link it to the current story.
          </p>
        </>
      ),
    },
    {
      question: 'Can I unlink stories?',
      answer: (
        <>
          <p>
            You can undo a link you have made between two fragments until
            another user has saved or added the resulting story.
          </p>
          <p>
            You can view all your links from your account page,{' '}
            <Link href="/account/links">
              <a>here</a>
            </Link>
            .
          </p>
        </>
      ),
    },
  ]

  return (
    <div className={styles.faq}>
      <h1>FAQ</h1>
      {content.map((c, i) => (
        <section key={i}>
          <h3>{c.question}</h3>
          {c.answer}
        </section>
      ))}
    </div>
  )
}

export default FAQ
