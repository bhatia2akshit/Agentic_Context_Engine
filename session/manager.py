from typing import Any, Dict, List
import json

class SessionManager:
    """
    Manages session state with JSON data.
    """
    def __init__(self, json_data: Dict[str, Any] | str):
        """
        Initialize SessionManager with JSON data.
        
        Args:
            json_data: Either a dictionary or a file path to JSON file
        """
        if isinstance(json_data, str):
            # If string, treat as file path
            with open(json_data, 'r') as f:
                self.state = json.load(f)
        elif isinstance(json_data, dict):
            # If dict, use directly
            self.state = json_data.copy()
        else:
            raise ValueError("json_data must be either a dict or a file path string")
    
    def get_current_state(self) -> Dict[str, Any]:
        """Return the current session state."""
        return self.state.copy()
    
    def update_json(self, data: Dict[str, Any]):
        """Update session state with new data."""
        self.state.update(data)
    
    def remove_json(self, keys: List[str]):
        """Remove specified keys from session state."""
        for key in keys:
            self.state.pop(key, None)
    
    def reset_state(self, new_state: Dict[str, Any]):
        """Completely replace the current state."""
        self.state = new_state.copy()