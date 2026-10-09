"""Compatibility entry point for servers that expect ``api.app:app``."""

from StockTake.wsgi import application as app

__all__ = ['app']
