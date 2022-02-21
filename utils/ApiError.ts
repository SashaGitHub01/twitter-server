export class ApiError extends Error {
   status: number;
   errors: string[];

   constructor(status: number, message: string, errors: string[] = []) {
      super(message);
      this.status = status;
      this.errors = errors;
   }

   static unauthorized(message = 'Пользователь не авторизован') {
      return new ApiError(401, message)
   }

   static badReq(message: string) {
      return new ApiError(400, message)
   }

   static notFound(message: string) {
      return new ApiError(404, message)
   }

   static internal(message: string) {
      return new ApiError(500, message)
   }
}