# nextjs/next-script-for-ga

## What it does

Enforces the use of the `next/script` component when implementing Google Analytics in Next.js applications,
instead of using regular `
// Using inline script for GA initialization
<script dangerouslySetInnerHTML={{
  __html: `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'GA_MEASUREMENT_ID');
  `
}} />
```

Examples of **correct** code for this rule:

```jsx
import Script from 'next/script'

// Using next/script for GA source
<Script
  src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"
  strategy="lazyOnload"
/>

// Using next/script for GA initialization
<Script id="google-analytics">
  {`
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'GA_MEASUREMENT_ID');
  `}
</Script>
```

## Version

This rule was added in v0.2.0.
