from src.modules.errors.app_error import AppError


class HTTPError(AppError):
    @staticmethod
    def not_found(message: str = "Resource not found.") -> "HTTPError":
        return HTTPError(message, 404)

    @staticmethod
    def unauthorized(message: str = "Unauthorized.") -> "HTTPError":
        return HTTPError(message, 401)

    @staticmethod
    def bad_request(message: str = "Invalid request.") -> "HTTPError":
        return HTTPError(message, 400)

    @staticmethod
    def too_many_requests(
        message: str = "Too many requests. Please try again later.",
    ) -> "HTTPError":
        return HTTPError(message, 429)
