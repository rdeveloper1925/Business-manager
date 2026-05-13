export type User = {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    two_factor_enabled: boolean;
};

export type Auth = {
    user: User | null;
};

export type TwoFactorSetupData = {
    svg: string;
    url: string;
};

export type TwoFactorSecretKey = {
    secretKey: string;
};
