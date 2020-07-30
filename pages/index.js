import Head from 'next/head';

const NOT_DEPLOYED = 'NOT_DEPLOYED';
class NotDeployedError extends Error {
  constructor() {
    super();
    this.code = NOT_DEPLOYED;
    this.message = 'Project must be deployed to Vercel';
  }
}

function App({ collections = [], isDeployed }) {
  const hasCollections = collections.length > 0;

  if (typeof isDeployed === 'undefined') {
    return <p>Loading...</p>;
  }

  return (
    <div style={{ maxWidth: 600, padding: 16 }}>
      <Head>
        <title>FaunaDB Vercel App</title>
        <meta
          name="viewport"
          content="initial-scale=1.0, width=device-width"
          key="viewport"
        />
        <link
          href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"
          rel="stylesheet"
        />
      </Head>
      <style jsx global>{`
        html,
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Roboto', sans-serif;
          line-height: 1.7rem;
        }

        code {
          font-family: Menlo, Monaco, 'Lucida Console', 'Liberation Mono',
            'DejaVu Sans Mono', 'Bitstream Vera Sans Mono', 'Courier New',
            monospace, serif;
        }
      `}</style>
      <h1>FaunaDB Vercel Integration</h1>
      {isDeployed ? (
        <>
          <h2>Collections</h2>
          {hasCollections ? (
            <ul>
              {collections.map(({ name }) => (
                <li key={name}>{name}</li>
              ))}
            </ul>
          ) : (
            <h5>No Collections</h5>
          )}
        </>
      ) : (
        <>
          <h2>Deploy to Vercel to verify integration</h2>
          <p style={{ fontSize: 20 }}>
            The <code>FAUNADB_SECRET</code> environment variable is not
            configured locally or in CodeSandbox, but will be available to the
            application when deployed to Vercel.
          </p>
          <h3>Steps to deploy</h3>
          <ol>
            <li>
              Click on the Deployment menu (the rocket icon in the sidebar)
            </li>
            <li>Click the "Fork Sandbox" button</li>
            <li>Return to the Deployment menu</li>
            <li>
              Click "Vercel" (You'll need to sign in to Vercel when you're
              deploying for the first time)
            </li>
            <li>
              Click the "Deploy" button, then click the "Deploy with Vercel"
              button in the DEPLOYMENT dialog
            </li>
            <li>
              Click the deployment link and wait for building to complete to
              verify that the application lists the collections in your database
            </li>
          </ol>
        </>
      )}
    </div>
  );
}

export async function getServerSideProps({ req }) {
  try {
    const { 'x-vercel-deployment-url': vercelURL } = req.headers;

    if (!vercelURL) {
      throw new NotDeployedError();
    }

    const res = await fetch(`https://${vercelURL}/api/collections`);
    const { collections, error } = await res.json();

    if (!res.ok) {
      throw new Error(error.message);
    }

    return { props: { collections, isDeployed: true } };
  } catch (error) {
    return {
      props: {
        error: {
          message: error.message,
        },
        isDeployed: error.code !== NOT_DEPLOYED,
      },
    };
  }
}

export default App;
