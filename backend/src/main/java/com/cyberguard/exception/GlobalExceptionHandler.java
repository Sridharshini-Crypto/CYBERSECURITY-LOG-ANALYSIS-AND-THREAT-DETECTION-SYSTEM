package com.cyberguard.exception;

import com.cyberguard.dto.ApiError;
import java.time.Instant;
import java.util.List;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiError> badRequest(IllegalArgumentException exception) {
        return error(HttpStatus.BAD_REQUEST, List.of(exception.getMessage()));
    }

    @ExceptionHandler({MethodArgumentNotValidException.class, MissingServletRequestParameterException.class})
    public ResponseEntity<ApiError> invalidRequest(Exception exception) {
        List<String> details = exception instanceof MethodArgumentNotValidException validation
                ? validation.getBindingResult().getFieldErrors().stream()
                    .map(field -> field.getField() + ": " + field.getDefaultMessage()).toList()
                : List.of(exception.getMessage());
        return error(HttpStatus.BAD_REQUEST, details);
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ApiError> tooLarge(MaxUploadSizeExceededException exception) {
        return error(HttpStatus.PAYLOAD_TOO_LARGE, List.of("The uploaded file exceeds the 25 MB limit."));
    }

    @ExceptionHandler(DataAccessException.class)
    public ResponseEntity<ApiError> databaseFailure(DataAccessException exception) {
        return error(HttpStatus.INTERNAL_SERVER_ERROR, List.of("The analysis could not be stored or retrieved."));
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ApiError> fileFailure(IllegalStateException exception) {
        return error(HttpStatus.BAD_REQUEST, List.of(exception.getMessage()));
    }

    private ResponseEntity<ApiError> error(HttpStatus status, List<String> details) {
        return ResponseEntity.status(status).body(new ApiError(Instant.now(), status.value(), status.getReasonPhrase(), details));
    }
}
