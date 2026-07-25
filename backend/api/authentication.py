"""
Custom authentication for Firebase.
This file handles verifying Firebase tokens and authenticating users.
"""

from rest_framework import authentication
from rest_framework import exceptions
from django.contrib.auth.models import User
from firebase_admin import auth
import logging

logger = logging.getLogger(__name__)

class FirebaseAuthentication(authentication.BaseAuthentication):
    """
    Custom authentication class that validates Firebase ID tokens.
    """
    
    def authenticate(self, request):
        """
        Authenticate the request using Firebase.
        Steps:
        1. Get the Authorization header
        2. Extract the token
        3. Verify token with Firebase
        4. Get or create Django user
        """
        
        # Get the authorization header
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return None  # No token, continue to next authentication method
        
        # Token should be in format: "Bearer <token>"
        try:
            token = auth_header.split(' ')[1]
        except IndexError:
            raise exceptions.AuthenticationFailed('Invalid token format. Use: Bearer <token>')
        
        try:
            # Verify the token with Firebase
            decoded_token = auth.verify_id_token(token)
            firebase_uid = decoded_token.get('uid')
            
            if not firebase_uid:
                raise exceptions.AuthenticationFailed('Invalid token: No UID')
            
            # Get or create a Django user linked to Firebase UID
            user, created = self.get_or_create_user(decoded_token)
            
            if not user:
                raise exceptions.AuthenticationFailed('User not found or inactive')
            
            # Return the user and the token (for potential additional use)
            return (user, token)
            
        except auth.InvalidIdTokenError:
            raise exceptions.AuthenticationFailed('Invalid Firebase token')
        except auth.ExpiredIdTokenError:
            raise exceptions.AuthenticationFailed('Firebase token expired')
        except Exception as e:
            logger.error(f"Firebase authentication error: {str(e)}")
            raise exceptions.AuthenticationFailed(f'Authentication failed: {str(e)}')
    
    def get_or_create_user(self, decoded_token):
        """
        Get or create a Django user from Firebase user data.
        """
        firebase_uid = decoded_token.get('uid')
        email = decoded_token.get('email', '')
        name = decoded_token.get('name', '')
        
        # Try to find existing user by Firebase UID
        # We'll store Firebase UID in the username field (prefixed)
        username = f"firebase_{firebase_uid}"
        
        try:
            # Try to get existing user
            user = User.objects.get(username=username)
            return (user, False)
        except User.DoesNotExist:
            # Create new user
            try:
                user = User.objects.create_user(
                    username=username,
                    email=email,
                    first_name=name.split()[0] if name else '',
                    last_name=' '.join(name.split()[1:]) if len(name.split()) > 1 else '',
                    password=None,  # Password managed by Firebase
                )
                # Set user as active
                user.is_active = True
                user.save()
                return (user, True)
            except Exception as e:
                logger.error(f"Error creating user: {str(e)}")
                return (None, False)