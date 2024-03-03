import { ConflictException, Injectable, Logger } from "@nestjs/common";
import { UsersService } from "../../users/users.service";
import { JwtService } from "@nestjs/jwt";
import { HashService } from "./hash.service";
import { RecaptchaEnterpriseServiceClient } from '@google-cloud/recaptcha-enterprise';

@Injectable()
export class AuthService {
  private readonly logger = new Logger();
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private hashService: HashService
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findByUsername(username);
    if (user && (await this.hashService.comparePassword(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.userId };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async signup(email: string, password: string, username: string): Promise<any> {
    const existingUser = await this.usersService.findByUsername(username);
    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    const hashedPassword = await this.hashService.hashPassword(password);

    return await this.usersService.createUser(email, hashedPassword, username);
  }

  async createAssessment({
    projectID = "my-project-tekta-1709329696852",
    recaptchaKey = "6LeTgoYpAAAAAONy7Avswm_Okm2v8rVHBuicexxR",
    token = "action-token",
    recaptchaAction = "action-name",
  }): Promise<number | null> {
    try {
      const client = new RecaptchaEnterpriseServiceClient();
      const projectPath = client.projectPath(projectID);
    
      const request = {
        assessment: {
          event: {
            token: token,
            siteKey: recaptchaKey,
          },
        },
        parent: projectPath,
      };
    
      const [response] = await client.createAssessment(request);
    
      if (!response.tokenProperties.valid) {
        console.log(`The CreateAssessment call failed because the token was: ${response.tokenProperties.invalidReason}`);
        return null;
      }
    
      if (response.tokenProperties.action === recaptchaAction) {
        console.log(`The reCAPTCHA score is: ${response.riskAnalysis.score}`);
        response.riskAnalysis.reasons.forEach((reason) => {
          console.log(reason);
        });
    
        return response.riskAnalysis.score;
      } else {
        console.log("The action attribute in your reCAPTCHA tag does not match the action you are expecting to score");
        return null;
      }
    } catch (error) {
      console.error("Error creating assessment:", error);
      return null;
    }
  }
}
