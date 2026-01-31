"""
Emergent LLM Integration
Universal key for OpenAI, Anthropic, Google models via emergentintegrations
"""

import os
import uuid
from typing import Optional, Dict, Any
import logging

logger = logging.getLogger(__name__)

try:
    from emergentintegrations.llm.chat import LlmChat, ChatError, UserMessage, ImageContent
    EMERGENT_AVAILABLE = True
    logger.info("emergentintegrations imported successfully")
except ImportError as e:
    logger.error(f"Failed to import emergentintegrations: {e}")
    EMERGENT_AVAILABLE = False
    LlmChat = None
    ChatError = Exception
    UserMessage = None
    ImageContent = None


class EmergentLLMClient:
    """Universal LLM client using Emergent key"""
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv('EMERGENT_LLM_KEY')
        
        if not self.api_key:
            logger.warning("No Emergent LLM key configured")
        
        logger.info(f"EmergentLLMClient initialized. Key present: {bool(self.api_key)}, Available: {EMERGENT_AVAILABLE}")
    
    def _get_session_id(self) -> str:
        """Generate a unique session ID"""
        return str(uuid.uuid4())
    
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
        - gemini-2.0-flash-exp (Google)
        """
        
        if not self.api_key:
            return {"error": "No Emergent LLM key configured"}
        
        if not EMERGENT_AVAILABLE:
            return {"error": "emergentintegrations not installed"}
        
        try:
            # Determine provider from model name
            if model.startswith('gpt-'):
                provider = "openai"
            elif model.startswith('claude-'):
                provider = "anthropic"
            elif model.startswith('gemini-'):
                provider = "gemini"
            else:
                return {"error": f"Unknown model: {model}"}
            
            # Extract system message if present
            system_message = "You are a helpful assistant."
            converted_messages = []
            
            for msg in messages:
                if msg.get('role') == 'system':
                    system_message = msg.get('content', system_message)
                else:
                    converted_messages.append(msg)
            
            # Create LlmChat instance
            chat = LlmChat(
                api_key=self.api_key,
                session_id=self._get_session_id(),
                system_message=system_message
            )
            
            # Configure model and provider
            chat = chat.with_model(provider, model)
            
            # Set temperature
            chat = chat.with_params(temperature=temperature)
            
            # Process all messages except the last one as history
            for msg in converted_messages[:-1]:
                if msg.get('role') == 'user':
                    await chat._add_user_message(chat.messages, UserMessage(text=msg.get('content', '')))
                elif msg.get('role') == 'assistant':
                    await chat._add_assistant_message(chat.messages, msg.get('content', ''))
            
            # Send the last user message and get response
            last_message = converted_messages[-1] if converted_messages else {"role": "user", "content": "Hello"}
            response_text = await chat.send_message(UserMessage(text=last_message.get('content', '')))
            
            return {
                "content": response_text,
                "model": model,
                "provider": provider,
                "usage": {
                    "prompt_tokens": 0,
                    "completion_tokens": 0,
                    "total_tokens": 0
                }
            }
        
        except ChatError as e:
            logger.error(f"Chat completion ChatError: {e}")
            return {"error": str(e)}
        except Exception as e:
            logger.error(f"Chat completion error: {e}")
            return {"error": str(e)}
    
    async def simple_completion(
        self,
        prompt: str,
        model: str = "gemini-2.0-flash-exp",
        system_message: str = "You are a helpful assistant.",
        temperature: float = 0.7
    ) -> str:
        """Simple one-shot completion"""
        
        if not self.api_key:
            raise ValueError("No Emergent LLM key configured")
        
        if not EMERGENT_AVAILABLE:
            raise ValueError("emergentintegrations not installed")
        
        # Determine provider from model name
        if model.startswith('gpt-'):
            provider = "openai"
        elif model.startswith('claude-'):
            provider = "anthropic"
        elif model.startswith('gemini-'):
            provider = "gemini"
        else:
            raise ValueError(f"Unknown model: {model}")
        
        chat = LlmChat(
            api_key=self.api_key,
            session_id=self._get_session_id(),
            system_message=system_message
        )
        
        chat = chat.with_model(provider, model).with_params(temperature=temperature)
        
        response = await chat.send_message(UserMessage(text=prompt))
        return response
    
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
                "claude-sonnet-4",
                "claude-3-5-sonnet-20241022"
            ],
            "google": [
                "gemini-2.0-flash-exp",
                "gemini-1.5-pro",
                "gemini-1.5-flash"
            ]
        }


# Global Emergent LLM client
emergent_llm_client = EmergentLLMClient()


def reload_emergent_client():
    """Reload client with new API key"""
    global emergent_llm_client
    emergent_llm_client = EmergentLLMClient()
