/**
 * HTTP Status Codes Constants
 *
 * Purpose: Standard HTTP status codes for API responses
 * - Provides type-safe status code constants
 * - Follows RFC 7231 and MDN Web Docs standards
 * - Organized by status code categories
 */

/**
 * Informational responses (100-199)
 */
export const HTTP_STATUS = {
  /**
   * Continue
   * The server has received the request headers and the client should proceed to send the request body
   */
  CONTINUE: 100,

  /**
   * Switching Protocols
   * The requester has asked the server to switch protocols
   */
  SWITCHING_PROTOCOLS: 101,

  /**
   * Processing
   * The server has received and is processing the request
   */
  PROCESSING: 102,

  /**
   * Successful responses (200-299)
   */
  /**
   * OK
   * The request has succeeded
   */
  OK: 200,

  /**
   * Created
   * The request has been fulfilled and a new resource has been created
   */
  CREATED: 201,

  /**
   * Accepted
   * The request has been accepted for processing
   */
  ACCEPTED: 202,

  /**
   * Non-Authoritative Information
   * The request was successful but the information may have been modified
   */
  NON_AUTHORITATIVE_INFORMATION: 203,

  /**
   * No Content
   * The request was successful but there is no content to return
   */
  NO_CONTENT: 204,

  /**
   * Reset Content
   * The request was successful and the user agent should reset the document view
   */
  RESET_CONTENT: 205,

  /**
   * Partial Content
   * The server is delivering only part of the resource
   */
  PARTIAL_CONTENT: 206,

  /**
   * Multi-Status
   * The message body that follows is an XML message and can contain a number of separate response codes
   */
  MULTI_STATUS: 207,

  /**
   * Already Reported
   * The members of a DAV binding have already been enumerated in a previous reply
   */
  ALREADY_REPORTED: 208,

  /**
   * IM Used
   * The server has fulfilled a request for the resource
   */
  IM_USED: 226,

  /**
   * Redirection messages (300-399)
   */
  /**
   * Multiple Choices
   * The request has more than one possible response
   */
  MULTIPLE_CHOICES: 300,

  /**
   * Moved Permanently
   * The URL of the requested resource has been changed permanently
   */
  MOVED_PERMANENTLY: 301,

  /**
   * Found
   * The URL of the requested resource has been changed temporarily
   */
  FOUND: 302,

  /**
   * See Other
   * The server sent this response to direct the client to get the requested resource at another URI
   */
  SEE_OTHER: 303,

  /**
   * Not Modified
   * The client has made a conditional request and the resource has not been modified
   */
  NOT_MODIFIED: 304,

  /**
   * Use Proxy
   * The requested resource must be accessed through a proxy
   */
  USE_PROXY: 305,

  /**
   * Temporary Redirect
   * The server sends this response to direct the client to get the requested resource at another URI
   */
  TEMPORARY_REDIRECT: 307,

  /**
   * Permanent Redirect
   * The resource is now permanently located at another URI
   */
  PERMANENT_REDIRECT: 308,

  /**
   * Client error responses (400-499)
   */
  /**
   * Bad Request
   * The server cannot or will not process the request due to an apparent client error
   */
  BAD_REQUEST: 400,

  /**
   * Unauthorized
   * The client must authenticate itself to get the requested response
   */
  UNAUTHORIZED: 401,

  /**
   * Payment Required
   * Reserved for future use
   */
  PAYMENT_REQUIRED: 402,

  /**
   * Forbidden
   * The client does not have access rights to the content
   */
  FORBIDDEN: 403,

  /**
   * Not Found
   * The server cannot find the requested resource
   */
  NOT_FOUND: 404,

  /**
   * Method Not Allowed
   * The request method is known by the server but is not supported by the target resource
   */
  METHOD_NOT_ALLOWED: 405,

  /**
   * Not Acceptable
   * The server cannot produce a response matching the list of acceptable values
   */
  NOT_ACCEPTABLE: 406,

  /**
   * Proxy Authentication Required
   * The client must first authenticate itself with the proxy
   */
  PROXY_AUTHENTICATION_REQUIRED: 407,

  /**
   * Request Timeout
   * The server did not receive a complete request message within the time that it was prepared to wait
   */
  REQUEST_TIMEOUT: 408,

  /**
   * Conflict
   * The request could not be completed due to a conflict with the current state of the resource
   */
  CONFLICT: 409,

  /**
   * Gone
   * The requested resource is no longer available at the server
   */
  GONE: 410,

  /**
   * Length Required
   * The server refuses to accept the request without a defined Content-Length
   */
  LENGTH_REQUIRED: 411,

  /**
   * Precondition Failed
   * One or more conditions given in the request header fields evaluated to false
   */
  PRECONDITION_FAILED: 412,

  /**
   * Payload Too Large
   * The request entity is larger than limits defined by the server
   */
  PAYLOAD_TOO_LARGE: 413,

  /**
   * URI Too Long
   * The URI provided was too long for the server to process
   */
  URI_TOO_LONG: 414,

  /**
   * Unsupported Media Type
   * The media format of the requested data is not supported by the server
   */
  UNSUPPORTED_MEDIA_TYPE: 415,

  /**
   * Range Not Satisfiable
   * The range specified by the Range header field cannot be fulfilled
   */
  RANGE_NOT_SATISFIABLE: 416,

  /**
   * Expectation Failed
   * The expectation given in the Expect request header field could not be met
   */
  EXPECTATION_FAILED: 417,

  /**
   * I'm a teapot
   * The server refuses the attempt to brew coffee with a teapot
   */
  IM_A_TEAPOT: 418,

  /**
   * Misdirected Request
   * The request was directed at a server that is not able to produce a response
   */
  MISDIRECTED_REQUEST: 421,

  /**
   * Unprocessable Entity
   * The request was well-formed but was unable to be followed due to semantic errors
   */
  UNPROCESSABLE_ENTITY: 422,

  /**
   * Locked
   * The resource that is being accessed is locked
   */
  LOCKED: 423,

  /**
   * Failed Dependency
   * The request failed because it depended on another request and that request failed
   */
  FAILED_DEPENDENCY: 424,

  /**
   * Too Early
   * The server is unwilling to risk processing a request that might be replayed
   */
  TOO_EARLY: 425,

  /**
   * Upgrade Required
   * The server refuses to perform the request using the current protocol
   */
  UPGRADE_REQUIRED: 426,

  /**
   * Precondition Required
   * The origin server requires the request to be conditional
   */
  PRECONDITION_REQUIRED: 428,

  /**
   * Too Many Requests
   * The user has sent too many requests in a given amount of time
   */
  TOO_MANY_REQUESTS: 429,

  /**
   * Request Header Fields Too Large
   * The server is unwilling to process the request because its header fields are too large
   */
  REQUEST_HEADER_FIELDS_TOO_LARGE: 431,

  /**
   * Unavailable For Legal Reasons
   * The server is denying access to the resource as a consequence of a legal demand
   */
  UNAVAILABLE_FOR_LEGAL_REASONS: 451,

  /**
   * Server error responses (500-599)
   */
  /**
   * Internal Server Error
   * The server has encountered a situation it doesn't know how to handle
   */
  INTERNAL_SERVER_ERROR: 500,

  /**
   * Not Implemented
   * The request method is not supported by the server and cannot be handled
   */
  NOT_IMPLEMENTED: 501,

  /**
   * Bad Gateway
   * The server, while acting as a gateway or proxy, received an invalid response
   */
  BAD_GATEWAY: 502,

  /**
   * Service Unavailable
   * The server is not ready to handle the request
   */
  SERVICE_UNAVAILABLE: 503,

  /**
   * Gateway Timeout
   * The server, while acting as a gateway or proxy, did not get a response in time
   */
  GATEWAY_TIMEOUT: 504,

  /**
   * HTTP Version Not Supported
   * The HTTP version used in the request is not supported by the server
   */
  HTTP_VERSION_NOT_SUPPORTED: 505,

  /**
   * Variant Also Negotiates
   * The server has an internal configuration error
   */
  VARIANT_ALSO_NEGOTIATES: 506,

  /**
   * Insufficient Storage
   * The method could not be performed on the resource because the server is unable to store
   */
  INSUFFICIENT_STORAGE: 507,

  /**
   * Loop Detected
   * The server detected an infinite loop while processing the request
   */
  LOOP_DETECTED: 508,

  /**
   * Not Extended
   * Further extensions to the request are required for the server to fulfill it
   */
  NOT_EXTENDED: 510,

  /**
   * Network Authentication Required
   * The client needs to authenticate to gain network access
   */
  NETWORK_AUTHENTICATION_REQUIRED: 511,
} as const;

/**
 * Type for HTTP status code values
 */
export type HttpStatusCode = (typeof HTTP_STATUS)[keyof typeof HTTP_STATUS];

/**
 * Helper function to check if status code is informational (100-199)
 */
export function isInformational(status: number): boolean {
  return status >= 100 && status < 200;
}

/**
 * Helper function to check if status code is successful (200-299)
 */
export function isSuccessful(status: number): boolean {
  return status >= 200 && status < 300;
}

/**
 * Helper function to check if status code is redirection (300-399)
 */
export function isRedirection(status: number): boolean {
  return status >= 300 && status < 400;
}

/**
 * Helper function to check if status code is client error (400-499)
 */
export function isClientError(status: number): boolean {
  return status >= 400 && status < 500;
}

/**
 * Helper function to check if status code is server error (500-599)
 */
export function isServerError(status: number): boolean {
  return status >= 500 && status < 600;
}
