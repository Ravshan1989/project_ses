import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { EventEmitter2 } from "@nestjs/event-emitter";

@Injectable()
export class NotificationInterceptor implements NestInterceptor {
  constructor(private eventEmitter: EventEmitter2) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, user } = request;

    // UZ: Faqat POST va muvaffaqiyatli yakunlangan so'rovlar uchun ishlaydi
    return next.handle().pipe(
      tap((data) => {
        if (
          method === "POST" &&
          (url.includes("submissions") || url.includes("daily-reports"))
        ) {
          // UZ: Event emit qilish
          this.eventEmitter.emit("submission.created", {
            orgName: user?.organization?.name || "Noma'lum tashkilot",
            url: url,
            timestamp: new Date(),
          });
        }
      }),
    );
  }
}
