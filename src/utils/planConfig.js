export const PLANS = {
    freemium: {
        name: 'Freemium',
        price: 0,
        currency: 'USDC',
        quotas: {
            projects: 3,
            storage: 1, // GB
            apiCalls: 500,
            teamMembers: 1
        },
        features: [
            '3 projects',
            'dappzy.io subdomains',
            'IPFS deployment',
            '1 GB cloud storage',
            'All dApps components',
            'dAppzy trademark'
        ]
    },
    pioneer: {
        name: 'Pioneer',
        price: {
            monthly: 20,
            annual: 16
        },
        currency: 'USDC',
        quotas: {
            projects: 10,
            storage: 10, // GB
            apiCalls: 2000,
            teamMembers: 5
        },
        features: [
            '10 projects',
            'Custom domains',
            'IPFS deployment',
            '10 GB cloud storage',
            'All dApps components',
            'Hide dAppzy trademark'
        ]
    }
};

export const getPlanQuotas = (planType) => {
    return PLANS[planType]?.quotas || PLANS.freemium.quotas;
};

export const getPlanFeatures = (planType) => {
    return PLANS[planType]?.features || PLANS.freemium.features;
};

export const getPlanPrice = (planType, billingCycle = 'monthly') => {
    if (planType === 'freemium') return 0;
    if (planType === 'pioneer') return PLANS.pioneer.price[billingCycle] || PLANS.pioneer.price.monthly;
    return 0;
}; 