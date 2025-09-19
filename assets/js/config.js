const CONFIG = {
    RT_ENDPOINT: 'https://rtephemeral.hosting.tigzig.com',
    PRIMARY_MODEL_STRUCTURE: 'google/gemini-2.0-flash-001',
    PRIMARY_MODEL_MARKET_VALUE: 'google/gemini-2.0-flash-001',
    OPENROUTER_MODEL_STRUCTURE: 'openai/gpt-4.1-mini',
    OPENROUTER_MODEL_MARKET_VALUE: 'openai/gpt-4o-mini',
    // OPENROUTER_MODEL_STRUCTURE: 'deepseek/deepseek-chat',
    // OPENROUTER_MODEL_MARKET_VALUE: 'deepseek/deepseek-chat'
    
    // Available models configuration
    AVAILABLE_MODELS: [
        {
            id: 'openai/gpt-4.1',
            displayName: 'GPT-4.1',
            provider: 'OpenAI',
            description: 'Powerful general-purpose model with strong reasoning'
        },
        {
            id: 'openai/gpt-4o-mini',
            displayName: 'GPT-4o Mini',
            provider: 'OpenAI',
            description: 'Faster, more economical version of GPT-4'
        },
        {
            id: 'google/gemini-2.0-flash-001',
            displayName: 'Gemini 2.0 Flash',
            provider: 'Google',
            description: 'Fast, efficient model for common tasks'
        },
        {
            id: 'google/gemini-2.5-flash',
            displayName: 'Gemini 2.5 Flash',
            provider: 'Google',
            description: 'Updated Flash model with improved performance'
        },
        {
            id: 'openai/gpt-4.1-mini',
            displayName: 'GPT-4.1-mini',
            provider: 'OpenAI',
            description: 'Updated mini version of GPT-4.1'
        },        
        {
            id: 'anthropic/claude-3.5-haiku',
            displayName: 'Claude 3.5 Haiku',
            provider: 'Anthropic',
            description: 'Updated Haiku version of Claude 3.5'
        },

        {
            id: 'anthropic/claude-sonnet-4',
            displayName: 'Claude 4 Sonnet',
            provider: 'Anthropic',
            description: 'Fast, high-quality model with strong reasoning'
        }
    ],
    
    // Display names for UI
    getDisplayName: function(model) {
        // Extract model name without provider prefix if it contains a slash
        if (model.includes('/')) {
            const parts = model.split('/');
            model = parts[1]; // Take just the model part after the provider
            return model; // Return exact model name without any transformations
        }
        
        // Only apply these mappings if model doesn't contain a slash
        const displayMap = {
            'gpt-4o': 'gpt-4.1',
            'gpt-4.1': 'gpt-4.1'
        };
        
        return displayMap[model] || model;
    },
    
    // Get model name for API calls
    getOpenRouterModelName: function(modelName) {
        // Handle any special cases here
        if (modelName === 'gpt-4o') {
            return 'openai/gpt-4.1';
        } 
        // If it's not already prefixed with a provider
        else if (!modelName.includes('/')) {
            // Assume it's OpenAI if not specified
            return `openai/${modelName}`;
        }
        // Return as is if it already has a provider prefix
        return modelName;
    },
    
    // Get model by ID
    getModelById: function(id) {
        return this.AVAILABLE_MODELS.find(model => model.id === id) || null;
    },
    
    // Get default model - now just returns the first model in the list
    getDefaultModel: function() {
        return this.AVAILABLE_MODELS[0];
    }
};

// Explicitly attach CONFIG to the window object
window.CONFIG = CONFIG;

// Log that the config has been loaded
console.log('Configuration loaded, CONFIG attached to window object');