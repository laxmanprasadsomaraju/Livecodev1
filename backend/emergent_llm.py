"""
Emergent LLM Integration
Universal key for OpenAI, Anthropic, Google models
Uses emergentintegrations.llm.chat for all LLM operations
"""

import os
from typing import Optional, Dict, Any
import logging

logger = logging.getLogger(__name__)

try:
    from emergentintegrations.llm.chat import LlmChat, UserMessage
    EMERGENT_AVAILABLE = True
    logger.info("emergentintegrations.llm.chat imported successfully")
except ImportError as e:
    logger.error(f"Failed to import emergentintegrations: {e}")
    EMERGENT_AVAILABLE = False

class EmergentLLMClient:
    """Universal LLM client using Emergent key via LlmChat"""
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv('EMERGENT_LLM_KEY')
        
        if not self.api_key:
            logger.warning("No Emergent LLM key configured")
        
        logger.info(f"EmergentLLMClient initialized. Key present: {bool(self.api_key)}, Available: {EMERGENT_AVAILABLE}")
    
    def get_chat(self, system_message: str, model: str = "gemini-3-flash-preview", session_id: str = None) -> Optional[LlmChat]:
        """Get a LlmChat instance"""
        if not EMERGENT_AVAILABLE or not self.api_key:
            return None
        
        try:
            import uuid
            if not session_id:
                session_id = str(uuid.uuid4())
            
            # Determine provider from model name
            if model.startswith('gpt-'):
                provider = "openai"
            elif model.startswith('claude-'):
                provider = "anthropic"
            else:
                provider = "gemini"
            
            chat = LlmChat(
                api_key=self.api_key,
                session_id=session_id,
                system_message=system_message
            ).with_model(provider, model)
            
            return chat
        except Exception as e:
            logger.error(f"Failed to create chat instance: {e}")
            return None
    
    async def chat_completion(
        self,
        model: str,
        messages: list,
        temperature: float = 0.7,
        max_tokens: int = 4000
    ) -> Dict[str, Any]:
        """
        Universal chat completion across providers
        
        Models:
        - gpt-4o, gpt-4o-mini (OpenAI)
        - claude-opus-4-5, claude-sonnet-4 (Anthropic)
        - gemini-3-flash-preview, gemini-3-pro-preview (Google)
        """
        
        if not self.api_key:
            return {"error": "No Emergent LLM key configured"}
        
        if not EMERGENT_AVAILABLE:
            return {"error": "emergentintegrations not installed"}
        
        try:
            # Extract system message and user message
            system_message = ""
            user_message = ""
            for msg in messages:
                if msg['role'] == 'system':
                    system_message = msg['content']
                elif msg['role'] == 'user':
                    user_message = msg['content']
            
            chat = self.get_chat(system_message, model)
            if not chat:
                return {"error": "Failed to create chat instance"}
            
            response = await chat.send_message(UserMessage(text=user_message))
            
            return {
                "content": response,
                "model": model,
                "provider": "emergent"
            }
        
        except Exception as e:
            logger.error(f"Chat completion error: {e}")
            return {"error": str(e)}
    
    def is_configured(self) -> bool:
        """Check if Emergent key is configured"""
        return bool(self.api_key and EMERGENT_AVAILABLE)
    
    def get_available_models(self) -> Dict[str, list]:
        """Get list of available models"""
        if not self.is_configured():
            return {}
        
        return {
            "openai": [
                "gpt-4o",
                "gpt-4o-mini",
                "gpt-4-turbo"
            ],
            "anthropic": [
                "claude-opus-4-5",
                "claude-sonnet-4"
            ],
            "google": [
                "gemini-3-flash-preview",
                "gemini-3-pro-preview",
                "gemini-2.5-pro",
                "gemini-2.5-flash-lite"
            ]
        }

# Global Emergent LLM client
emergent_llm_client = EmergentLLMClient()

def reload_emergent_client():
    """Reload client with new API key"""
    global emergent_llm_client
    emergent_llm_client = EmergentLLMClient()
