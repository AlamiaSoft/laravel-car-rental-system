import { usePage } from '@inertiajs/react';

export default function ApplicationLogo({ className = '', ...props }) {
    const { appName } = usePage().props;
    const name = appName || 'OrmEasy';
    
    // If GuestLayout passes h-20, let's scale it up a bit
    const isLarge = className.includes('h-20');
    
    // We filter out conflicting display/sizing classes to preserve the logo's internal flex layout
    const filteredClassName = className
        .replace(/block|h-\d+|w-\d+|w-auto/g, '')
        .trim();

    return (
        <div 
            className={`flex items-center gap-2 font-extrabold text-gray-900 dark:text-white ${isLarge ? 'text-3xl' : 'text-xl'} ${filteredClassName}`} 
            style={{ fontFamily: '"Manrope", sans-serif' }}
            {...props}
        >
            <div 
                className="flex items-center justify-center text-white rounded-lg"
                style={{
                    width: isLarge ? '52px' : '34px', 
                    height: isLarge ? '52px' : '34px',
                    background: 'linear-gradient(135deg, #16A34A, #0F7A38)',
                    fontSize: isLarge ? '26px' : '17px',
                    boxShadow: '0 4px 12px -3px rgba(22,163,74,.55)'
                }}
            >
                {name.charAt(0).toUpperCase()}
            </div>
            <span>{name}</span>
        </div>
    );
}
