
import React from 'react';

interface IconProps {
  name: 'home' | 'microphone' | 'journal' | 'resources' | 'send' | 'close' | 'play' | 'pause' | 'logo';
  className?: string;
}

const ICONS: Record<IconProps['name'], React.FC<{className?: string}>> = {
  home: ({ className }) => <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.5 1.5 0 012.122 0l8.954 8.955M3 10.5v9A2.25 2.25 0 005.25 21h3.75a.75.75 0 00.75-.75V16.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75v3.75a.75.75 0 00.75.75h3.75A2.25 2.25 0 0021 19.5v-9M12 2.25v3" />,
  microphone: ({ className }) => <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m12 0v-1.5a6 6 0 00-12 0v1.5m6 7.5v3.75m-3.75 0h7.5" />,
  journal: ({ className }) => <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />,
  resources: ({ className }) => <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />,
  send: ({ className }) => <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />,
  close: ({ className }) => <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />,
  play: ({ className }) => <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.972l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />,
  pause: ({ className }) => <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-6-13.5v13.5" />,
  logo: ({ className }) => <path d="M12 2a10 10 0 00-9.36 13.31l-.01.01a.5.5 0 00.4.68H4a1 1 0 011 1v1a1 1 0 01-1 1H3a.5.5 0 00-.4.18l-.01.01A10 10 0 1012 2zm0 4a6 6 0 100 12 6 6 0 000-12zM12 8a4 4 0 110 8 4 4 0 010-8z"/>,
};

const Icon: React.FC<IconProps> = ({ name, className = 'w-6 h-6' }) => {
  const IconComponent = ICONS[name];
  if (!IconComponent) return null;

  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <IconComponent className={className} />
    </svg>
  );
};

export default Icon;
