import '@testing-library/jest-dom';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock Next.js Image component
jest.mock('next/image', () => {
  return {
    __esModule: true,
    default: function Image(props: Record<string, unknown>) {
      // Basit bir img elementi döndür (React.createElement ile)
      return require('react').createElement('img', props);
    },
  };
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  root = null;
  rootMargin = '';
  thresholds = [];
  
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
  takeRecords() {
    return [];
  }
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Supabase Mock - Kapsamlı
jest.mock('@/lib/supabase', () => {
  // Self-referencing mock için factory fonksiyonu
  const createMockQueryBuilder = () => {
    const builder: Record<string, jest.Mock> = {};
    
    // Zincirleme metodlar
    const chainMethods = [
      'select', 'insert', 'update', 'delete', 'upsert',
      'eq', 'neq', 'gt', 'lt', 'gte', 'lte',
      'like', 'ilike', 'is', 'in', 'contains', 'containedBy',
      'range', 'overlap', 'or', 'and', 'not', 'filter', 'match',
      'order', 'limit', 'offset', 'textSearch', 'csv'
    ];
    
    chainMethods.forEach(method => {
      builder[method] = jest.fn(() => builder);
    });
    
    // Sonlandırıcı metodlar
    builder.single = jest.fn().mockResolvedValue({ data: null, error: null });
    builder.maybeSingle = jest.fn().mockResolvedValue({ data: null, error: null });
    builder.then = jest.fn((resolve) => resolve({ data: [], error: null, count: 0 }));
    
    return builder;
  };

  interface MockChannel {
    on: jest.Mock;
    subscribe: jest.Mock;
  }

  const mockChannel: MockChannel = {
    on: jest.fn(function(this: MockChannel) { return this; }),
    subscribe: jest.fn(() => ({ 
      unsubscribe: jest.fn(),
      status: 'SUBSCRIBED'
    })),
  };

  const mockSupabase = {
    auth: {
      getSession: jest.fn().mockResolvedValue({ 
        data: { session: null }, 
        error: null 
      }),
      getUser: jest.fn().mockResolvedValue({ 
        data: { user: null }, 
        error: null 
      }),
      signInWithPassword: jest.fn().mockResolvedValue({ 
        data: { user: null, session: null }, 
        error: null 
      }),
      signUp: jest.fn().mockResolvedValue({ 
        data: { user: null, session: null }, 
        error: null 
      }),
      signOut: jest.fn().mockResolvedValue({ error: null }),
      resetPasswordForEmail: jest.fn().mockResolvedValue({ 
        data: {}, 
        error: null 
      }),
      updateUser: jest.fn().mockResolvedValue({ 
        data: { user: null }, 
        error: null 
      }),
      onAuthStateChange: jest.fn((callback) => {
        // İsteğe bağlı olarak callback'i çağır
        if (callback) {
          setTimeout(() => callback('INITIAL_SESSION', null), 0);
        }
        return {
          data: { 
            subscription: { 
              unsubscribe: jest.fn(),
              id: 'mock-subscription-id'
            } 
          },
        };
      }),
      refreshSession: jest.fn().mockResolvedValue({ 
        data: { session: null }, 
        error: null 
      }),
    },
    from: jest.fn(() => createMockQueryBuilder()),
    channel: jest.fn(() => mockChannel),
    removeChannel: jest.fn().mockResolvedValue({ status: 'ok' }),
    removeAllChannels: jest.fn().mockResolvedValue([]),
    getChannels: jest.fn().mockReturnValue([]),
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn().mockResolvedValue({ 
          data: { path: 'test-path', id: 'test-id', fullPath: 'bucket/test-path' }, 
          error: null 
        }),
        download: jest.fn().mockResolvedValue({ 
          data: new Blob(['test']), 
          error: null 
        }),
        getPublicUrl: jest.fn((path) => ({ 
          data: { publicUrl: `http://test.com/${path}` } 
        })),
        remove: jest.fn().mockResolvedValue({ data: [], error: null }),
        list: jest.fn().mockResolvedValue({ data: [], error: null }),
        move: jest.fn().mockResolvedValue({ data: null, error: null }),
        copy: jest.fn().mockResolvedValue({ data: null, error: null }),
        createSignedUrl: jest.fn().mockResolvedValue({ 
          data: { signedUrl: 'http://test.com/signed' }, 
          error: null 
        }),
      })),
      listBuckets: jest.fn().mockResolvedValue({ data: [], error: null }),
      getBucket: jest.fn().mockResolvedValue({ data: null, error: null }),
    },
    rpc: jest.fn().mockResolvedValue({ data: null, error: null }),
    functions: {
      invoke: jest.fn().mockResolvedValue({ data: null, error: null }),
    },
  };

  return {
    supabase: mockSupabase,
  };
});
